import type { NextFunction, Request, Response } from "express";
import type {
  ReviewAdminQuery,
  ReviewInput,
  ReviewProductQuery,
  ReviewReplyInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as reviewService from "./review.service.js";

export const listProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const query = getValidated<ReviewProductQuery>(req, "query");
    const result = await reviewService.listProductReviews(productId, query);
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const eligibility = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const result = await reviewService.getEligibility(
      req.user!.userId,
      productId,
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<ReviewInput>(req, "body");
    const review = await reviewService.createReview(
      req.user!.userId,
      input,
    );
    return sendSuccess(res, review, "Review created", 201);
  } catch (error) {
    next(error);
  }
};

export const listAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getValidated<ReviewAdminQuery>(req, "query");
    const result = await reviewService.listAdminReviews(query);
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const reply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { reviewId } = getValidated<{ reviewId: string }>(req, "params");
    const input = getValidated<ReviewReplyInput>(req, "body");
    const review = await reviewService.replyToReview(reviewId, input);
    return sendSuccess(res, review, "Reply saved");
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
    const { reviewId } = getValidated<{ reviewId: string }>(req, "params");
    const result = await reviewService.deleteReview(reviewId);
    return sendSuccess(res, result, "Review deleted");
  } catch (error) {
    next(error);
  }
};

export default {
  listProduct,
  eligibility,
  create,
  listAdmin,
  reply,
  remove,
};
