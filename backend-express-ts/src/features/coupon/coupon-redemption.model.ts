import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

const couponRedemptionSchema = new Schema(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

couponRedemptionSchema.index({ couponId: 1, orderId: 1 }, { unique: true });
couponRedemptionSchema.index({ couponId: 1, userId: 1 });

export type CouponRedemption = InferSchemaType<typeof couponRedemptionSchema>;
export type CouponRedemptionDocument = HydratedDocument<CouponRedemption>;

export default model<CouponRedemption>(
  "CouponRedemption",
  couponRedemptionSchema,
);
