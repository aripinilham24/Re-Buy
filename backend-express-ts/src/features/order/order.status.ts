import type { OrderStatus } from "@rebuy/contracts";

export const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled", "expired"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["completed", "refunded"],
  completed: ["refunded"],
  cancelled: [],
  expired: [],
  refunded: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) =>
  allowedTransitions[from].includes(to);

export const cancelStatuses: OrderStatus[] = ["cancelled", "expired"];
