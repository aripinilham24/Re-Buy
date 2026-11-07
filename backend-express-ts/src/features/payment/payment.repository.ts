import PaymentModel, { type PaymentDocument } from "./payment.model.js";

export const findPaymentByOrderId = (orderId: string) =>
  PaymentModel.findOne({ orderId });

export const findPaymentByOrderNumber = (orderNumber: string) =>
  PaymentModel.findOne({ orderNumber });

export const createPayment = (data: {
  orderId: string;
  orderNumber: string;
  userId: string;
  status: PaymentDocument["status"];
  grossAmount: number;
  snapToken?: string;
  redirectUrl?: string;
  transactionId?: string;
  rawPayload?: unknown;
  expiresAt?: Date;
}) => PaymentModel.create(data);

export const updatePayment = (
  paymentId: string,
  data: Partial<{
    status: PaymentDocument["status"];
    snapToken: string;
    redirectUrl: string;
    transactionId: string;
    grossAmount: number;
    rawPayload: unknown;
    paidAt: Date;
    expiresAt: Date;
  }>,
) =>
  PaymentModel.findByIdAndUpdate(paymentId, data, {
    returnDocument: "after",
    runValidators: true,
  });
