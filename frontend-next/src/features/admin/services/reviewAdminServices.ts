import type { ApiSuccess, ReviewDto } from "@rebuy/contracts";
import api from "@/lib/axios";

export const listAdminReviewsService = async () => {
  const response = await api.get<ApiSuccess<ReviewDto[]>>("/admin/reviews", {
    params: { limit: 50 },
  });
  return response.data.data;
};

export const replyAdminReviewService = async (
  reviewId: string,
  reply: string,
) => {
  const response = await api.patch<ApiSuccess<ReviewDto>>(
    `/admin/reviews/${reviewId}/reply`,
    { reply },
  );
  return response.data.data;
};

export const deleteAdminReviewService = async (reviewId: string) => {
  await api.delete(`/admin/reviews/${reviewId}`);
};
