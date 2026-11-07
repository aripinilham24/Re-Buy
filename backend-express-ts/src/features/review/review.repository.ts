import { Types } from "mongoose";
import type { ReviewDto } from "@rebuy/contracts";
import type { ReviewDocument } from "./review.model.js";
import ReviewModel from "./review.model.js";
import { decodeCursor, encodeCursor } from "../../common/pagination.js";
import { toPublicObjectUrl } from "../../config/s3.js";

export const toReviewDto = (review: ReviewDocument): ReviewDto => ({
  reviewId: review._id.toString(),
  productId: review.productId.toString(),
  userId: review.userId.toString(),
  userName: review.userName,
  rating: review.rating,
  comment: review.comment,
  images: review.images.map(toPublicObjectUrl),
  adminReply: review.adminReply ?? undefined,
  createdAt: new Date(review.createdAt).toISOString(),
});

export const createReview = (data: {
  userId: string;
  userName: string;
  orderId: string;
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}) => ReviewModel.create(data);

export const findReviewByOrderProduct = (
  orderId: string,
  productId: string,
) => ReviewModel.findOne({ orderId, productId });

export const findReviewById = (reviewId: string) =>
  ReviewModel.findById(reviewId);

export const updateReviewReply = (reviewId: string, reply: string) =>
  ReviewModel.findByIdAndUpdate(
    reviewId,
    { adminReply: reply, adminRepliedAt: new Date() },
    { returnDocument: "after" },
  );

export const deleteReview = (reviewId: string) =>
  ReviewModel.findByIdAndDelete(reviewId);

const listReviews = async (
  filter: Record<string, unknown>,
  limit: number,
  cursor?: string,
) => {
  const createdAtCursor = decodeCursor<{ createdAt: string; id: string }>(
    cursor,
  );
  if (createdAtCursor) {
    const createdAt = new Date(createdAtCursor.createdAt);
    filter.$and = [
      {
        $or: [
          { createdAt: { $lt: createdAt } },
          { createdAt, _id: { $lt: createdAtCursor.id } },
        ],
      },
    ];
  }

  const reviews = await ReviewModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = reviews.length > limit;
  const page = hasMore ? reviews.slice(0, limit) : reviews;
  const last = page[page.length - 1];

  return {
    items: page,
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeCursor({
            createdAt: new Date(last.createdAt).toISOString(),
            id: last._id.toString(),
          })
        : null,
  };
};

export const listProductReviews = (
  productId: string,
  limit: number,
  cursor?: string,
) => listReviews({ productId }, limit, cursor);

export const listAllReviews = (limit: number, cursor?: string) =>
  listReviews({}, limit, cursor);

export const aggregateProductRating = async (productId: string) => {
  const stats = await ReviewModel.aggregate<{
    avg: number;
    count: number;
  }>([
    { $match: { productId: new Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  return {
    ratingAvg: stats[0] ? Math.round(stats[0].avg * 10) / 10 : 0,
    ratingCount: stats[0]?.count ?? 0,
  };
};
