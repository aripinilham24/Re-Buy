import type {
  MidtransNotification,
  PaymentDto,
  PaymentStatus,
  PaymentStatusResult,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import * as orderRepository from "../order/order.repository.js";
import * as orderService from "../order/order.service.js";
import * as userRepository from "../user/user.repository.js";
import * as paymentRepository from "./payment.repository.js";
import { toPaymentDto } from "./payment.mapper.js";
import {
  createSnapTransaction,
  getMidtransTransactionStatus,
  verifyMidtransSignature,
} from "./midtrans.client.js";

const PAYMENT_TTL_MS = 24 * 60 * 60 * 1000;

const mapTransactionStatus = (
  transactionStatus: string,
  fraudStatus?: string,
): PaymentStatus => {
  switch (transactionStatus) {
    case "capture":
      return fraudStatus === "challenge" ? "pending" : "paid";
    case "settlement":
      return "paid";
    case "pending":
      return "pending";
    case "expire":
      return "expired";
    case "deny":
    case "cancel":
    case "failure":
      return "failed";
    case "refund":
    case "partial_refund":
      return "refunded";
    default:
      return "pending";
  }
};

const applyOutcome = async (
  orderId: string,
  status: PaymentStatus,
) => {
  if (status === "paid") {
    await orderService.applyPaymentOutcome(orderId, "paid");
  } else if (status === "expired") {
    await orderService.applyPaymentOutcome(orderId, "expired");
  } else if (status === "failed") {
    await orderService.applyPaymentOutcome(orderId, "failed");
  } else if (status === "refunded") {
    await orderService.applyPaymentOutcome(orderId, "refunded");
  }
};

export const createPayment = async (
  userId: string,
  orderId: string,
): Promise<PaymentDto> => {
  const order = await orderRepository.findOrderForUser(orderId, userId);
  if (!order) throw AppError.notFound("Order not found");
  if (order.status !== "pending_payment") {
    throw AppError.badRequest("Order is not awaiting payment");
  }

  const existing = await paymentRepository.findPaymentByOrderId(orderId);
  if (
    existing &&
    existing.status === "pending" &&
    existing.snapToken &&
    existing.expiresAt &&
    existing.expiresAt > new Date()
  ) {
    return toPaymentDto(existing);
  }

  const user = await userRepository.findUserById(userId);
  if (!user) throw AppError.notFound("User not found");

  const snap = await createSnapTransaction({
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: order.grandTotal,
    },
    customer_details: {
      first_name: order.address.recipientName,
      email: user.email,
    },
    expiry: { unit: "hours", duration: 24 },
  });

  const expiresAt = new Date(Date.now() + PAYMENT_TTL_MS);

  if (existing) {
    const updated = await paymentRepository.updatePayment(
      existing._id.toString(),
      {
        status: "pending",
        snapToken: snap.token,
        redirectUrl: snap.redirect_url,
        grossAmount: order.grandTotal,
        expiresAt,
        rawPayload: snap,
      },
    );
    if (!updated) throw AppError.notFound("Payment not found");
    return toPaymentDto(updated);
  }

  const payment = await paymentRepository.createPayment({
    orderId,
    orderNumber: order.orderNumber,
    userId,
    status: "pending",
    grossAmount: order.grandTotal,
    snapToken: snap.token,
    redirectUrl: snap.redirect_url,
    rawPayload: snap,
    expiresAt,
  });

  return toPaymentDto(payment);
};

export const getPaymentStatus = async (
  userId: string,
  orderId: string,
): Promise<PaymentStatusResult> => {
  const order = await orderRepository.findOrderForUser(orderId, userId);
  if (!order) throw AppError.notFound("Order not found");

  const payment = await paymentRepository.findPaymentByOrderId(orderId);

  return {
    orderStatus: order.status,
    payment: payment ? toPaymentDto(payment) : null,
  };
};

export const handleMidtransNotification = async (
  payload: MidtransNotification,
) => {
  const valid = verifyMidtransSignature(
    payload.order_id,
    payload.status_code,
    payload.gross_amount,
    payload.signature_key,
  );
  if (!valid) throw AppError.badRequest("Invalid Midtrans signature");

  const order = await orderRepository.findOrderByNumber(payload.order_id);
  if (!order) throw AppError.notFound("Order not found");

  if (Number(payload.gross_amount) !== order.grandTotal) {
    throw AppError.badRequest("Payment amount does not match the order");
  }

  const payment = await paymentRepository.findPaymentByOrderId(
    order._id.toString(),
  );
  if (!payment) throw AppError.notFound("Payment not found");

  const status = mapTransactionStatus(
    payload.transaction_status,
    payload.fraud_status,
  );

  if (payment.status === "paid" && status === "paid") {
    return { received: true };
  }

  const updated = await paymentRepository.updatePayment(
    payment._id.toString(),
    {
      status,
      transactionId: payload.transaction_id,
      rawPayload: payload,
      ...(status === "paid" ? { paidAt: new Date() } : {}),
    },
  );
  if (!updated) throw AppError.notFound("Payment not found");

  await applyOutcome(order._id.toString(), status);

  return { received: true };
};

export const syncPayment = async (userId: string, orderId: string) => {
  const order = await orderRepository.findOrderForUser(orderId, userId);
  if (!order) throw AppError.notFound("Order not found");

  const payment = await paymentRepository.findPaymentByOrderId(orderId);
  if (!payment) throw AppError.notFound("Payment not found");

  const statusPayload = await getMidtransTransactionStatus(order.orderNumber);
  const status = mapTransactionStatus(
    statusPayload.transaction_status,
    statusPayload.fraud_status,
  );

  const updated = await paymentRepository.updatePayment(
    payment._id.toString(),
    {
      status,
      transactionId: statusPayload.transaction_id,
      rawPayload: statusPayload,
      ...(status === "paid" ? { paidAt: new Date() } : {}),
    },
  );
  if (!updated) throw AppError.notFound("Payment not found");

  await applyOutcome(order._id.toString(), status);

  return toPaymentDto(updated);
};
