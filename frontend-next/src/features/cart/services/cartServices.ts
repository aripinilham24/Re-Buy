import type { ApiSuccess, CartDto, CartItemInput, CartItemUpdate } from "@rebuy/contracts";
import api from "@/lib/axios";

export const getCartService = async () => {
  const response = await api.get<ApiSuccess<CartDto>>("/cart");
  return response.data.data;
};

export const addCartItemService = async (data: CartItemInput) => {
  const response = await api.post<ApiSuccess<CartDto>>("/cart/items", data);
  return response.data.data;
};

export const updateCartItemService = async (
  productId: string,
  data: CartItemUpdate,
) => {
  const response = await api.patch<ApiSuccess<CartDto>>(
    `/cart/items/${productId}`,
    data,
  );
  return response.data.data;
};

export const removeCartItemService = async (productId: string) => {
  const response = await api.delete<ApiSuccess<CartDto>>(
    `/cart/items/${productId}`,
  );
  return response.data.data;
};

export const clearCartService = async () => {
  const response = await api.delete<ApiSuccess<CartDto>>("/cart");
  return response.data.data;
};
