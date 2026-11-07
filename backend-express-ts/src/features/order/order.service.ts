import type {
  CheckoutInput,
  CheckoutQuote,
  OrderDto,
  OrderListQuery,
  OrderStatus,
  OrderStatusUpdateInput,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import { env } from "../../config/env.js";
import * as addressRepository from "../user/address.repository.js";
import * as cartService from "../cart/cart.service.js";
import * as couponRepository from "../coupon/coupon.repository.js";
import { validateCoupon } from "../coupon/coupon.service.js";
import * as productRepository from "../product/product.repository.js";
import * as orderRepository from "./order.repository.js";
import { toOrderDto } from "./order.mapper.js";
import { generateOrderNumber } from "./order.number.js";
import { canTransition, cancelStatuses } from "./order.status.js";
import type { OrderDocument } from "./order.model.js";

const createUniqueOrderNumber = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = generateOrderNumber();
    if (!(await orderRepository.orderNumberExists(orderNumber))) {
      return orderNumber;
    }
  }

  throw new AppError(
    "Failed to generate a unique order number",
    500,
    "ORDER_NUMBER_FAILED",
  );
};

const rollbackCheckout = async (params: {
  stockItems: Array<{ productId: string; quantity: number }>;
  couponId?: string;
  couponReserved: boolean;
  orderId?: string;
}) => {
  await Promise.allSettled(
    params.stockItems.map((item) =>
      productRepository.incrementStock(item.productId, item.quantity),
    ),
  );

  if (params.couponId && params.couponReserved) {
    await couponRepository.releaseCouponUsage(params.couponId);
  }

  if (params.orderId) {
    await couponRepository.deleteRedemptionByOrder(params.orderId);
    await orderRepository.deleteOrder(params.orderId);
  }
};

export const quote = async (
  userId: string,
  couponCode?: string,
): Promise<CheckoutQuote> => {
  const cart = await cartService.getCart(userId);
  const coupon = couponCode
    ? await validateCoupon(couponCode, cart.subtotal, userId)
    : null;
  const discount = coupon?.discount ?? 0;
  const shippingCost = env.SHIPPING_FLAT_RATE;

  return {
    subtotal: cart.subtotal,
    discount,
    shippingCost,
    grandTotal: cart.subtotal - discount + shippingCost,
  };
};

export const checkout = async (
  userId: string,
  input: CheckoutInput,
): Promise<{ order: OrderDto }> => {
  const cart = await cartService.getCart(userId);
  if (cart.items.length === 0) {
    throw AppError.badRequest("Cart is empty");
  }

  const address = await addressRepository.findAddress(
    userId,
    input.addressId,
  );
  if (!address) throw AppError.notFound("Address not found");

  for (const item of cart.items) {
    if (item.product.status !== "active") {
      throw AppError.conflict(`${item.product.name} is not available`);
    }
    if (item.product.stock < item.quantity) {
      throw AppError.conflict(`Insufficient stock for ${item.product.name}`);
    }
  }

  const coupon = input.couponCode
    ? await validateCoupon(input.couponCode, cart.subtotal, userId)
    : null;
  const discount = coupon?.discount ?? 0;
  const shippingCost = env.SHIPPING_FLAT_RATE;
  const grandTotal = cart.subtotal - discount + shippingCost;
  if (grandTotal < 0) {
    throw AppError.badRequest("Invalid order total");
  }

  const orderNumber = await createUniqueOrderNumber();
  const stockItems: Array<{ productId: string; quantity: number }> = [];
  const couponId = coupon?.coupon._id.toString();
  let couponReserved = false;
  let orderId: string | undefined;

  try {
    for (const item of cart.items) {
      const updated = await productRepository.decrementStock(
        item.product.productId,
        item.quantity,
      );
      if (!updated) {
        throw AppError.conflict(
          `Insufficient stock for ${item.product.name}`,
        );
      }
      stockItems.push({
        productId: item.product.productId,
        quantity: item.quantity,
      });
    }

    if (couponId) {
      const reserved = await couponRepository.reserveCouponUsage(couponId);
      if (!reserved) {
        throw AppError.conflict("Coupon usage limit reached");
      }
      couponReserved = true;
    }

    const order = await orderRepository.createOrder({
      userId,
      orderNumber,
      items: cart.items.map((item) => ({
        productId: item.product.productId,
        name: item.product.name,
        slug: item.product.slug,
        imageKey: item.product.images[0]?.key,
        price: item.product.price,
        quantity: item.quantity,
      })),
      subtotal: cart.subtotal,
      discount,
      shippingCost,
      grandTotal,
      ...(coupon && couponId
        ? { couponId, couponCode: coupon.coupon.code }
        : {}),
      address: {
        label: address.label,
        recipientName: address.recipientName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        province: address.province,
        postalCode: address.postalCode,
        notes: address.notes ?? undefined,
      },
      notes: input.notes,
      status: "pending_payment",
      statusHistory: [{ status: "pending_payment", at: new Date() }],
    });

    orderId = order._id.toString();

    if (couponId) {
      await couponRepository.createRedemption({
        couponId,
        userId,
        orderId,
        discount,
      });
    }
  } catch (error) {
    await rollbackCheckout({
      stockItems,
      couponId,
      couponReserved,
      orderId,
    });
    throw error;
  }

  await cartService.clearCart(userId);

  const order = await orderRepository.findOrderById(orderId!);
  if (!order) throw AppError.notFound("Order not found");

  return { order: toOrderDto(order) };
};

const mapList = (result: Awaited<ReturnType<typeof orderRepository.listOrders>>) => ({
  items: result.items.map(toOrderDto),
  nextCursor: result.nextCursor,
  hasMore: result.hasMore,
});

export const listMine = async (userId: string, query: OrderListQuery) => {
  const result = await orderRepository.listOrders({
    userId,
    status: query.status,
    limit: query.limit,
    cursor: query.cursor,
  });
  return mapList(result);
};

export const listAdmin = async (query: OrderListQuery) => {
  const result = await orderRepository.listOrders({
    status: query.status,
    limit: query.limit,
    cursor: query.cursor,
  });
  return mapList(result);
};

export const getMine = async (userId: string, orderId: string) => {
  const order = await orderRepository.findOrderForUser(orderId, userId);
  if (!order) throw AppError.notFound("Order not found");

  return toOrderDto(order);
};

export const getAdmin = async (orderId: string) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) throw AppError.notFound("Order not found");

  return toOrderDto(order);
};

const restoreResources = async (order: OrderDocument) => {
  await Promise.allSettled(
    order.items.map((item) =>
      productRepository.incrementStock(
        item.productId.toString(),
        item.quantity,
      ),
    ),
  );

  if (order.couponId) {
    await couponRepository.releaseCouponUsage(order.couponId.toString());
    await couponRepository.deleteRedemptionByOrder(order._id.toString());
  }
};

const applyTransition = async (
  order: OrderDocument,
  status: OrderStatus,
  options?: { note?: string; trackingNumber?: string },
) => {
  if (!canTransition(order.status as OrderStatus, status)) {
    throw AppError.badRequest(
      `Cannot change status from ${order.status} to ${status}`,
    );
  }

  if (cancelStatuses.includes(status)) {
    await restoreResources(order);
  }

  if (status === "completed") {
    await Promise.allSettled(
      order.items.map((item) =>
        productRepository.incrementSoldCount(
          item.productId.toString(),
          item.quantity,
        ),
      ),
    );
  }

  const updated = await orderRepository.transitionOrder(
    order._id.toString(),
    status,
    options,
  );
  if (!updated) throw AppError.notFound("Order not found");

  return toOrderDto(updated);
};

export const cancelMine = async (userId: string, orderId: string) => {
  const order = await orderRepository.findOrderForUser(orderId, userId);
  if (!order) throw AppError.notFound("Order not found");

  if (order.status !== "pending_payment") {
    throw AppError.badRequest("Only pending orders can be cancelled");
  }

  return applyTransition(order, "cancelled", { note: "Cancelled by user" });
};

export const updateStatusAdmin = async (
  orderId: string,
  input: OrderStatusUpdateInput,
) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) throw AppError.notFound("Order not found");

  return applyTransition(order, input.status, {
    note: input.note,
    trackingNumber: input.trackingNumber,
  });
};

export type PaymentOutcome = "paid" | "expired" | "failed" | "refunded";

export const applyPaymentOutcome = async (
  orderId: string,
  outcome: PaymentOutcome,
) => {
  const order = await orderRepository.findOrderById(orderId);
  if (!order) throw AppError.notFound("Order not found");

  if (outcome === "paid") {
    if (order.status !== "pending_payment") return toOrderDto(order);
    return applyTransition(order, "paid", { note: "Payment settled" });
  }

  if (outcome === "expired" || outcome === "failed") {
    if (order.status !== "pending_payment") return toOrderDto(order);
    const target = outcome === "expired" ? "expired" : "cancelled";
    return applyTransition(order, target, {
      note: `Payment ${outcome}`,
    });
  }

  if (["paid", "processing", "shipped", "delivered", "completed"].includes(order.status)) {
    return applyTransition(order, "refunded", {
      note: "Payment refunded",
    });
  }

  return toOrderDto(order);
};
