import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CartItemInput } from "@rebuy/contracts";
import { getErrorMessage } from "@/lib/errors";
import {
  addCartItemService,
  clearCartService,
  getCartService,
  removeCartItemService,
  updateCartItemService,
} from "../services/cartServices";

export const useCart = (enabled = true) =>
  useQuery({
    queryKey: ["cart"],
    queryFn: getCartService,
    enabled,
  });

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CartItemInput) => addCartItemService(data),
    onSuccess: () => {
      toast.success("Ditambahkan ke keranjang");
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menambah ke keranjang")),
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => updateCartItemService(productId, { quantity }),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui keranjang")),
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => removeCartItemService(productId),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Item dihapus");
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus item")),
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearCartService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};
