"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReviewDto } from "@rebuy/contracts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import {
  deleteAdminReviewService,
  listAdminReviewsService,
  replyAdminReviewService,
} from "../services/reviewAdminServices";

function ReviewRow({
  review,
  onChanged,
}: {
  review: ReviewDto;
  onChanged: () => void;
}) {
  const [reply, setReply] = useState(review.adminReply ?? "");

  const saveReply = useMutation({
    mutationFn: () => replyAdminReviewService(review.reviewId, reply),
    onSuccess: () => {
      toast.success("Balasan disimpan");
      onChanged();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menyimpan balasan")),
  });

  const remove = useMutation({
    mutationFn: () => deleteAdminReviewService(review.reviewId),
    onSuccess: () => {
      toast.success("Review dihapus");
      onChanged();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus review")),
  });

  return (
    <article className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-white">{review.userName}</p>
          <p className="text-xs text-gray-500">
            {formatDate(review.createdAt)}
          </p>
        </div>
        <span className="text-yellow-400">
          {"★".repeat(review.rating)}
        </span>
      </div>

      <p className="text-gray-300">{review.comment}</p>

      <div className="flex flex-wrap gap-2">
        <Input
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Balas review"
          className="max-w-md"
        />
        <Button
          size="sm"
          disabled={saveReply.isPending || !reply.trim()}
          onClick={() => saveReply.mutate()}
        >
          {saveReply.isPending ? "Menyimpan..." : "Simpan balasan"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm("Hapus review ini?")) remove.mutate();
          }}
        >
          Hapus
        </Button>
      </div>
    </article>
  );
}

export function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: listAdminReviewsService,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });

  if (isLoading) {
    return <p className="text-sm text-gray-400">Memuat...</p>;
  }

  if (reviews.length === 0) {
    return <EmptyState title="Belum ada review" />;
  }

  return (
    <section className="space-y-3">
      {reviews.map((review) => (
        <ReviewRow key={review.reviewId} review={review} onChanged={refresh} />
      ))}
    </section>
  );
}
