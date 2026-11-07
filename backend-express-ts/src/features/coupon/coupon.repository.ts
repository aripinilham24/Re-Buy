import type {
  CouponDto,
  CouponInput,
  UpdateCouponInput,
} from "@rebuy/contracts";
import CouponModel, { type CouponDocument } from "./coupon.model.js";
import CouponRedemptionModel from "./coupon-redemption.model.js";

export const toCouponDto = (coupon: CouponDocument): CouponDto => ({
  couponId: coupon._id.toString(),
  code: coupon.code,
  type: coupon.type,
  value: coupon.value,
  minSpend: coupon.minSpend,
  maxDiscount: coupon.maxDiscount ?? undefined,
  usageLimit: coupon.usageLimit ?? undefined,
  usedCount: coupon.usedCount,
  perUserLimit: coupon.perUserLimit,
  startsAt: coupon.startsAt?.toISOString(),
  endsAt: coupon.endsAt?.toISOString(),
  isActive: coupon.isActive,
  createdAt: new Date(coupon.createdAt).toISOString(),
});

export const listCoupons = () =>
  CouponModel.find().sort({ createdAt: -1 });

export const findCouponByCode = (code: string) =>
  CouponModel.findOne({ code: code.toUpperCase() });

export const findCouponById = (couponId: string) =>
  CouponModel.findById(couponId);

export const couponCodeExists = async (code: string) =>
  Boolean(await CouponModel.exists({ code: code.toUpperCase() }));

export const createCoupon = (data: CouponInput) =>
  CouponModel.create(data);

export const updateCoupon = (
  couponId: string,
  data: UpdateCouponInput,
) =>
  CouponModel.findByIdAndUpdate(couponId, data, {
    returnDocument: "after",
    runValidators: true,
  });

export const deleteCoupon = (couponId: string) =>
  CouponModel.findByIdAndDelete(couponId);

export const countUserRedemptions = (couponId: string, userId: string) =>
  CouponRedemptionModel.countDocuments({ couponId, userId });

export const reserveCouponUsage = (couponId: string) =>
  CouponModel.findOneAndUpdate(
    {
      _id: couponId,
      isActive: true,
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    },
    { $inc: { usedCount: 1 } },
    { returnDocument: "after" },
  );

export const releaseCouponUsage = (couponId: string) =>
  CouponModel.findByIdAndUpdate(couponId, { $inc: { usedCount: -1 } });

export const createRedemption = (data: {
  couponId: string;
  userId: string;
  orderId: string;
  discount: number;
}) => CouponRedemptionModel.create(data);

export const deleteRedemptionByOrder = (orderId: string) =>
  CouponRedemptionModel.findOneAndDelete({ orderId });
