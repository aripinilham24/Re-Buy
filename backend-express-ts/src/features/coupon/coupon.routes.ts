import { Router } from "express";
import { z } from "zod";
import {
  couponInputSchema,
  objectIdSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import CouponController from "./coupon.controller.js";

const couponParamsSchema = z.object({ couponId: objectIdSchema });

export const userCouponRouter = Router();
userCouponRouter.post(
  "/validate",
  verifyAuth,
  validate({ body: validateCouponSchema }),
  CouponController.validate,
);

export const adminCouponRouter = Router();
adminCouponRouter.get("/", CouponController.list);
adminCouponRouter.post(
  "/",
  validate({ body: couponInputSchema }),
  CouponController.create,
);
adminCouponRouter.patch(
  "/:couponId",
  validate({ params: couponParamsSchema, body: updateCouponSchema }),
  CouponController.update,
);
adminCouponRouter.delete(
  "/:couponId",
  validate({ params: couponParamsSchema }),
  CouponController.remove,
);
