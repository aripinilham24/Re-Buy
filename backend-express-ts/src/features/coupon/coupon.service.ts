import type {
  CouponDto,
  CouponInput,
  CouponValidationResult,
  UpdateCouponInput,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import { getCart } from "../cart/cart.service.js";
import * as couponRepository from "./coupon.repository.js";
import { toCouponDto } from "./coupon.repository.js";
import type { CouponDocument as CouponModelDocument } from "./coupon.model.js";

const computeDiscount = (
  coupon: CouponModelDocument,
  subtotal: number,
) => {
  const raw =
    coupon.type === "percent"
      ? Math.floor((subtotal * coupon.value) / 100)
      : Math.floor(coupon.value);

  const capped =
    coupon.maxDiscount !== undefined && coupon.maxDiscount !== null
      ? Math.min(raw, coupon.maxDiscount)
      : raw;

  return Math.max(0, Math.min(capped, subtotal));
};

export const validateCoupon = async (
  code: string,
  subtotal: number,
  userId?: string,
): Promise<{ coupon: CouponModelDocument; discount: number }> => {
  const coupon = await couponRepository.findCouponByCode(code);
  if (!coupon || !coupon.isActive) {
    throw AppError.badRequest("Coupon is invalid or inactive");
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw AppError.badRequest("Coupon is not active yet");
  }
  if (coupon.endsAt && coupon.endsAt < now) {
    throw AppError.badRequest("Coupon has expired");
  }
  if (subtotal < coupon.minSpend) {
    throw AppError.badRequest(
      `Minimum spend for this coupon is ${coupon.minSpend}`,
    );
  }
  if (
    coupon.usageLimit !== undefined &&
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw AppError.badRequest("Coupon usage limit reached");
  }

  if (userId) {
    const redemptions = await couponRepository.countUserRedemptions(
      coupon._id.toString(),
      userId,
    );
    if (redemptions >= coupon.perUserLimit) {
      throw AppError.badRequest("Coupon already used");
    }
  }

  const discount = computeDiscount(coupon, subtotal);
  if (discount <= 0) {
    throw AppError.badRequest("Coupon does not apply to this order");
  }

  return { coupon, discount };
};

export const validateCouponForCart = async (
  userId: string,
  code: string,
): Promise<CouponValidationResult> => {
  const cart = await getCart(userId);
  if (cart.items.length === 0) {
    throw AppError.badRequest("Cart is empty");
  }

  const { coupon, discount } = await validateCoupon(
    code,
    cart.subtotal,
    userId,
  );

  return {
    couponId: coupon._id.toString(),
    code: coupon.code,
    discount,
  };
};

export const listCoupons = async (): Promise<CouponDto[]> => {
  const coupons = await couponRepository.listCoupons();
  return coupons.map(toCouponDto);
};

export const createCoupon = async (
  input: CouponInput,
): Promise<CouponDto> => {
  const exists = await couponRepository.couponCodeExists(input.code);
  if (exists) throw AppError.conflict("Coupon code already exists");

  const coupon = await couponRepository.createCoupon(input);
  return toCouponDto(coupon);
};

export const updateCoupon = async (
  couponId: string,
  input: UpdateCouponInput,
): Promise<CouponDto> => {
  const existing = await couponRepository.findCouponById(couponId);
  if (!existing) throw AppError.notFound("Coupon not found");

  if (input.code && input.code !== existing.code) {
    const exists = await couponRepository.couponCodeExists(input.code);
    if (exists) throw AppError.conflict("Coupon code already exists");
  }

  const coupon = await couponRepository.updateCoupon(couponId, input);
  if (!coupon) throw AppError.notFound("Coupon not found");

  return toCouponDto(coupon);
};

export const deleteCoupon = async (couponId: string) => {
  const coupon = await couponRepository.deleteCoupon(couponId);
  if (!coupon) throw AppError.notFound("Coupon not found");

  return { deleted: true };
};
