import type { OrderStatus } from "@rebuy/contracts";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "Menunggu pembayaran",
  paid: "Dibayar",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Diterima",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  expired: "Kedaluwarsa",
  refunded: "Dikembalikan",
};

export const orderStatusClasses: Record<OrderStatus, string> = {
  pending_payment: "bg-yellow-500/15 text-yellow-300",
  paid: "bg-blue-500/15 text-blue-300",
  processing: "bg-indigo-500/15 text-indigo-300",
  shipped: "bg-purple-500/15 text-purple-300",
  delivered: "bg-green-500/15 text-green-300",
  completed: "bg-green-500/15 text-green-300",
  cancelled: "bg-red-500/15 text-red-300",
  expired: "bg-gray-500/15 text-gray-300",
  refunded: "bg-orange-500/15 text-orange-300",
};
