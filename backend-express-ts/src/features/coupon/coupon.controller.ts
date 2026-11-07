import type { NextFunction, Request, Response } from "express";
import type {
  CouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as couponService from "./coupon.service.js";

export const validate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code } = getValidated<ValidateCouponInput>(req, "body");
    const result = await couponService.validateCouponForCart(
      req.user!.userId,
      code,
    );
    return sendSuccess(res, result, "Coupon applied");
  } catch (error) {
    next(error);
  }
};

export const list = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const coupons = await couponService.listCoupons();
    return sendSuccess(res, coupons);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<CouponInput>(req, "body");
    const coupon = await couponService.createCoupon(input);
    return sendSuccess(res, coupon, "Coupon created", 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { couponId } = getValidated<{ couponId: string }>(req, "params");
    const input = getValidated<UpdateCouponInput>(req, "body");
    const coupon = await couponService.updateCoupon(couponId, input);
    return sendSuccess(res, coupon, "Coupon updated");
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { couponId } = getValidated<{ couponId: string }>(req, "params");
    const result = await couponService.deleteCoupon(couponId);
    return sendSuccess(res, result, "Coupon deleted");
  } catch (error) {
    next(error);
  }
};

export default { validate, list, create, update, remove };
