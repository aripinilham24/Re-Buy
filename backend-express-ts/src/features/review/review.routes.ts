import { Router } from "express";
import { z } from "zod";
import {
  objectIdSchema,
  reviewAdminQuerySchema,
  reviewInputSchema,
  reviewProductQuerySchema,
  reviewReplySchema,
} from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import ReviewController from "./review.controller.js";

const productParamsSchema = z.object({ productId: objectIdSchema });
const reviewParamsSchema = z.object({ reviewId: objectIdSchema });

export const publicReviewRouter = Router();
publicReviewRouter.get(
  "/product/:productId",
  validate({ params: productParamsSchema, query: reviewProductQuerySchema }),
  ReviewController.listProduct,
);

export const userReviewRouter = Router();
userReviewRouter.use(verifyAuth);
userReviewRouter.get(
  "/eligibility/:productId",
  validate({ params: productParamsSchema }),
  ReviewController.eligibility,
);
userReviewRouter.post(
  "/",
  validate({ body: reviewInputSchema }),
  ReviewController.create,
);

export const adminReviewRouter = Router();
adminReviewRouter.get(
  "/",
  validate({ query: reviewAdminQuerySchema }),
  ReviewController.listAdmin,
);
adminReviewRouter.patch(
  "/:reviewId/reply",
  validate({ params: reviewParamsSchema, body: reviewReplySchema }),
  ReviewController.reply,
);
adminReviewRouter.delete(
  "/:reviewId",
  validate({ params: reviewParamsSchema }),
  ReviewController.remove,
);
