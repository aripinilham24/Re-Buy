import type { ApiSuccess, CouponValidationResult } from "@rebuy/contracts";
import api from "@/lib/axios";

export const validateCouponService = async (code: string) => {
  const response = await api.post<ApiSuccess<CouponValidationResult>>(
    "/coupons/validate",
    { code },
  );
  return response.data.data;
};
