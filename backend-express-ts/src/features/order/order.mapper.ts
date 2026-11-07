import type { OrderDto } from "@rebuy/contracts";
import { toPublicObjectUrl } from "../../config/s3.js";
import type { OrderDocument } from "./order.model.js";

export const toOrderDto = (order: OrderDocument): OrderDto => ({
  orderId: order._id.toString(),
  orderNumber: order.orderNumber,
  status: order.status,
  items: order.items.map((item) => ({
    productId: item.productId.toString(),
    name: item.name,
    slug: item.slug,
    imageUrl: item.imageKey ? toPublicObjectUrl(item.imageKey) : undefined,
    price: item.price,
    quantity: item.quantity,
    lineTotal: item.price * item.quantity,
  })),
  subtotal: order.subtotal,
  discount: order.discount,
  shippingCost: order.shippingCost,
  grandTotal: order.grandTotal,
  coupon:
    order.couponId && order.couponCode
      ? {
          couponId: order.couponId.toString(),
          code: order.couponCode,
          discount: order.discount,
        }
      : undefined,
  notes: order.notes ?? undefined,
  address: {
    label: order.address.label,
    recipientName: order.address.recipientName,
    phone: order.address.phone,
    street: order.address.street,
    city: order.address.city,
    province: order.address.province,
    postalCode: order.address.postalCode,
    notes: order.address.notes ?? undefined,
  },
  trackingNumber: order.trackingNumber ?? undefined,
  statusHistory: order.statusHistory.map((entry) => ({
    status: entry.status as OrderDto["status"],
    at: new Date(entry.at).toISOString(),
    note: entry.note ?? undefined,
  })),
  createdAt: new Date(order.createdAt).toISOString(),
  updatedAt: new Date(order.updatedAt).toISOString(),
});
