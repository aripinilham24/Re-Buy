import type { PaymentDto } from "@rebuy/contracts";
import type { PaymentDocument } from "./payment.model.js";

export const toPaymentDto = (payment: PaymentDocument): PaymentDto => ({
  paymentId: payment._id.toString(),
  orderId: payment.orderId.toString(),
  orderNumber: payment.orderNumber,
  provider: "midtrans",
  status: payment.status,
  snapToken: payment.snapToken ?? undefined,
  redirectUrl: payment.redirectUrl ?? undefined,
  transactionId: payment.transactionId ?? undefined,
  grossAmount: payment.grossAmount,
  paidAt: payment.paidAt?.toISOString(),
  expiresAt: payment.expiresAt?.toISOString(),
});
