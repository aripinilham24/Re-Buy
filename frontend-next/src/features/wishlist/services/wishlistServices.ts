import type { ApiSuccess, WishlistItemDto } from "@rebuy/contracts";
import api from "@/lib/axios";

export const listWishlistService = async () => {
  const response = await api.get<ApiSuccess<WishlistItemDto[]>>("/wishlist");
  return response.data.data;
};

export const addWishlistService = async (productId: string) => {
  const response = await api.post<ApiSuccess<WishlistItemDto>>(
    `/wishlist/${productId}`,
  );
  return response.data.data;
};

export const removeWishlistService = async (productId: string) => {
  await api.delete(`/wishlist/${productId}`);
};
