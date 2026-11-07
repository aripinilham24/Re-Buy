import { z } from "zod";
import type { OrderStatus } from "./common.js";

export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "expired",
  "failed",
  "refunded",
]);

export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export interface PaymentDto {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  provider: "midtrans";
  status: PaymentStatus;
  snapToken?: string;
  redirectUrl?: string;
  transactionId?: string;
  grossAmount: number;
  paidAt?: string;
  expiresAt?: string;
}

export interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_id?: string;
  payment_type?: string;
  transaction_time?: string;
  expiry_time?: string;
}

export const midtransNotificationSchema = z
  .object({
    order_id: z.string().min(1),
    status_code: z.string().min(1),
    gross_amount: z.string().min(1),
    signature_key: z.string().min(1),
    transaction_status: z.string().min(1),
    fraud_status: z.string().optional(),
    transaction_id: z.string().optional(),
    payment_type: z.string().optional(),
    transaction_time: z.string().optional(),
    expiry_time: z.string().optional(),
  })
  .passthrough();

export interface PaymentStatusResult {
  orderStatus: OrderStatus;
  payment: PaymentDto | null;
}
