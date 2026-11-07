import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const paymentSchema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["midtrans"],
      default: "midtrans",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "expired", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    snapToken: String,
    redirectUrl: String,
    transactionId: String,
    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    rawPayload: {
      type: Schema.Types.Mixed,
    },
    paidAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type Payment = InferSchemaType<typeof paymentSchema>;
export type PaymentDocument = HydratedDocument<Payment>;

export default model<Payment>("Payment", paymentSchema);
