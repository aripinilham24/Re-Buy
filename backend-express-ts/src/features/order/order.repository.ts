import type { QueryFilter } from "mongoose";
import type { OrderStatus } from "@rebuy/contracts";
import OrderModel, { type Order } from "./order.model.js";
import { decodeCursor, encodeCursor } from "../../common/pagination.js";

export const orderNumberExists = async (orderNumber: string) =>
  Boolean(await OrderModel.exists({ orderNumber }));

export const createOrder = (data: Record<string, unknown>) =>
  OrderModel.create(data);

export const findOrderById = (orderId: string) =>
  OrderModel.findById(orderId);

export const findOrderByNumber = (orderNumber: string) =>
  OrderModel.findOne({ orderNumber });

export const findCompletedOrderForProduct = (
  userId: string,
  productId: string,
) =>
  OrderModel.findOne({
    userId,
    status: "completed",
    "items.productId": productId,
  });

export const findOrderForUser = (orderId: string, userId: string) =>
  OrderModel.findOne({ _id: orderId, userId });

export const deleteOrder = (orderId: string) =>
  OrderModel.findByIdAndDelete(orderId);

export interface OrderListParams {
  userId?: string;
  status?: OrderStatus;
  limit: number;
  cursor?: string;
}

export const listOrders = async (params: OrderListParams) => {
  const filter: QueryFilter<Order> = {};
  if (params.userId) filter.userId = params.userId;
  if (params.status) filter.status = params.status;

  const cursor = decodeCursor<{ createdAt: string; id: string }>(
    params.cursor,
  );
  if (cursor) {
    const createdAt = new Date(cursor.createdAt);
    filter.$and = [
      {
        $or: [
          { createdAt: { $lt: createdAt } },
          { createdAt, _id: { $lt: cursor.id } },
        ],
      },
    ];
  }

  const orders = await OrderModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(params.limit + 1);

  const hasMore = orders.length > params.limit;
  const page = hasMore ? orders.slice(0, params.limit) : orders;
  const last = page[page.length - 1];

  return {
    items: page,
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeCursor({
            createdAt: new Date(last.createdAt).toISOString(),
            id: last._id.toString(),
          })
        : null,
  };
};

export const transitionOrder = (
  orderId: string,
  status: OrderStatus,
  options?: { note?: string; trackingNumber?: string },
) =>
  OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status,
        ...(options?.trackingNumber
          ? { trackingNumber: options.trackingNumber }
          : {}),
        ...(status === "paid" ? { paidAt: new Date() } : {}),
      },
      $push: {
        statusHistory: {
          status,
          at: new Date(),
          ...(options?.note ? { note: options.note } : {}),
        },
      },
    },
    { returnDocument: "after" },
  );

export type { OrderDocument } from "./order.model.js";
