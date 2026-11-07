"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import {
  useCreateReview,
  useProductReviews,
  useReviewEligibility,
} from "../hooks/useReviews";

interface ReviewSectionProps {
  productId: string;
  ratingAvg: number;
  ratingCount: number;
}

export function ReviewSection({
  productId,
  ratingAvg,
  ratingCount,
}: ReviewSectionProps) {
  const user = useAuthStore((state) => state.user);
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const eligibility = useReviewEligibility(productId, Boolean(user));
  const createReview = useCreateReview(productId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!eligibility.data?.orderId) return;

    try {
      await createReview.mutateAsync({
        orderId: eligibility.data.orderId,
        productId,
        rating,
        comment,
      });
      setComment("");
      setRating(5);
    } catch {
      // The mutation already surfaces a toast.
    }
  };

  return (
    <section className="space-y-4 border-t border-gray-800 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Review</h2>
        <p className="text-sm text-gray-400">
          {ratingAvg.toFixed(1)} / 5 · {ratingCount} review
        </p>
      </div>

      {user && eligibility.data?.canReview ? (
        <form
          onSubmit={submit}
          className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4"
        >
          <div className="flex items-center gap-3">
            <Label htmlFor="review-rating">Rating</Label>
            <select
              id="review-rating"
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} bintang
                </option>
              ))}
            </select>
          </div>
          <Input
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Tulis pengalaman kamu"
          />
          <Button
            type="submit"
            disabled={
              createReview.isPending || comment.trim().length < 3
            }
          >
            {createReview.isPending ? "Mengirim..." : "Kirim review"}
          </Button>
        </form>
      ) : user ? (
        <p className="text-sm text-gray-400">
          {eligibility.data?.reason ?? "Memeriksa status review..."}
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat review...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400">Belum ada review.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.reviewId}
              className="space-y-1 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {review.userName}
                </span>
                <span className="text-yellow-400">
                  {"★".repeat(review.rating)}
                </span>
              </div>
              <p className="text-gray-300">{review.comment}</p>
              <p className="text-xs text-gray-500">
                {formatDate(review.createdAt)}
              </p>
              {review.adminReply ? (
                <div className="mt-2 rounded-lg bg-gray-800/60 p-2">
                  <p className="text-xs font-medium text-green-400">
                    Balasan admin
                  </p>
                  <p className="text-gray-300">{review.adminReply}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
