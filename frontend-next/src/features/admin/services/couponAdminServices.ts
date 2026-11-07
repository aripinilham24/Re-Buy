import type { ApiSuccess, CouponDto, CouponInput, UpdateCouponInput } from "@rebuy/contracts";
import api from "@/lib/axios";

export const listAdminCouponsService = async () => {
  const response = await api.get<ApiSuccess<CouponDto[]>>("/admin/coupons");
  return response.data.data;
};

export const createAdminCouponService = async (data: CouponInput) => {
  const response = await api.post<ApiSuccess<CouponDto>>(
    "/admin/coupons",
    data,
  );
  return response.data.data;
};

export const updateAdminCouponService = async (
  couponId: string,
  data: UpdateCouponInput,
) => {
  const response = await api.patch<ApiSuccess<CouponDto>>(
    `/admin/coupons/${couponId}`,
    data,
  );
  return response.data.data;
};

export const deleteAdminCouponService = async (couponId: string) => {
  await api.delete(`/admin/coupons/${couponId}`);
};
