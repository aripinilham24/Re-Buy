import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReviewInput } from "@rebuy/contracts";
import { getErrorMessage } from "@/lib/errors";
import {
  createReviewService,
  getReviewEligibilityService,
  listProductReviewsService,
} from "../services/reviewServices";

export const useProductReviews = (productId: string) =>
  useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => listProductReviewsService(productId),
    enabled: Boolean(productId),
  });

export const useReviewEligibility = (
  productId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["review-eligibility", productId],
    queryFn: () => getReviewEligibilityService(productId),
    enabled: Boolean(productId) && enabled,
    retry: false,
  });

export const useCreateReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewInput) => createReviewService(data),
    onSuccess: () => {
      toast.success("Review dikirim");
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({
        queryKey: ["review-eligibility", productId],
      });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal mengirim review")),
  });
};
