import type {
  ReviewAdminQuery,
  ReviewDto,
  ReviewEligibility,
  ReviewInput,
  ReviewProductQuery,
  ReviewReplyInput,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import * as orderRepository from "../order/order.repository.js";
import * as productRepository from "../product/product.repository.js";
import * as userRepository from "../user/user.repository.js";
import * as reviewRepository from "./review.repository.js";
import { toReviewDto } from "./review.repository.js";

const recomputeRating = async (productId: string) => {
  const stats = await reviewRepository.aggregateProductRating(productId);
  await productRepository.updateProductRating(
    productId,
    stats.ratingAvg,
    stats.ratingCount,
  );
};

export const getEligibility = async (
  userId: string,
  productId: string,
): Promise<ReviewEligibility> => {
  const order = await orderRepository.findCompletedOrderForProduct(
    userId,
    productId,
  );
  if (!order) {
    return {
      canReview: false,
      reason: "Review tersedia setelah pesanan selesai",
    };
  }

  const existing = await reviewRepository.findReviewByOrderProduct(
    order._id.toString(),
    productId,
  );
  if (existing) {
    return { canReview: false, reason: "Kamu sudah mereview produk ini" };
  }

  return { canReview: true, orderId: order._id.toString() };
};

export const createReview = async (
  userId: string,
  input: ReviewInput,
): Promise<ReviewDto> => {
  const order = await orderRepository.findOrderForUser(
    input.orderId,
    userId,
  );
  if (!order) throw AppError.notFound("Order not found");
  if (order.status !== "completed") {
    throw AppError.badRequest(
      "Review is allowed after the order is completed",
    );
  }

  const item = order.items.find(
    (entry) => entry.productId.toString() === input.productId,
  );
  if (!item) throw AppError.badRequest("Product is not part of this order");

  const existing = await reviewRepository.findReviewByOrderProduct(
    input.orderId,
    input.productId,
  );
  if (existing) throw AppError.conflict("Product already reviewed");

  const user = await userRepository.findUserById(userId);
  if (!user) throw AppError.notFound("User not found");

  const review = await reviewRepository.createReview({
    userId,
    userName: user.username,
    orderId: input.orderId,
    productId: input.productId,
    rating: input.rating,
    comment: input.comment,
    images: input.images,
  });

  await recomputeRating(input.productId);

  return toReviewDto(review);
};

export const listProductReviews = async (
  productId: string,
  query: ReviewProductQuery,
) => {
  const result = await reviewRepository.listProductReviews(
    productId,
    query.limit,
    query.cursor,
  );

  return {
    items: result.items.map(toReviewDto),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
};

export const listAdminReviews = async (query: ReviewAdminQuery) => {
  const result = await reviewRepository.listAllReviews(
    query.limit,
    query.cursor,
  );

  return {
    items: result.items.map(toReviewDto),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
};

export const replyToReview = async (
  reviewId: string,
  input: ReviewReplyInput,
): Promise<ReviewDto> => {
  const existing = await reviewRepository.findReviewById(reviewId);
  if (!existing) throw AppError.notFound("Review not found");

  const review = await reviewRepository.updateReviewReply(
    reviewId,
    input.reply,
  );
  if (!review) throw AppError.notFound("Review not found");

  return toReviewDto(review);
};

export const deleteReview = async (reviewId: string) => {
  const review = await reviewRepository.deleteReview(reviewId);
  if (!review) throw AppError.notFound("Review not found");

  await recomputeRating(review.productId.toString());
  return { deleted: true };
};
