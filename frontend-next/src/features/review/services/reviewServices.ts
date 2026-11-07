import type {
  ApiSuccess,
  ReviewDto,
  ReviewEligibility,
  ReviewInput,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export const listProductReviewsService = async (productId: string) => {
  const response = await api.get<ApiSuccess<ReviewDto[]>>(
    `/reviews/product/${productId}`,
    { params: { limit: 50 } },
  );
  return response.data.data;
};

export const getReviewEligibilityService = async (productId: string) => {
  const response = await api.get<ApiSuccess<ReviewEligibility>>(
    `/reviews/eligibility/${productId}`,
  );
  return response.data.data;
};

export const createReviewService = async (data: ReviewInput) => {
  const response = await api.post<ApiSuccess<ReviewDto>>("/reviews", data);
  return response.data.data;
};
