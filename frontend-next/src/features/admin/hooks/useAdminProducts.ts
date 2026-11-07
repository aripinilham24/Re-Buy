import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { ProductInput, ProductStatus, UpdateProductInput } from "@rebuy/contracts";
import { getErrorMessage } from "@/lib/errors";
import {
  createAdminProductService,
  deleteAdminProductService,
  getAdminProductService,
  listAdminProductsService,
  updateAdminProductService,
  type AdminProductListParams,
} from "../services/productAdminServices";

export const useAdminProducts = (
  params: AdminProductListParams,
) =>
  useInfiniteQuery({
    queryKey: ["admin-products", params],
    queryFn: ({ pageParam }) =>
      listAdminProductsService({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
  });

export const useAdminProduct = (productId: string) =>
  useQuery({
    queryKey: ["admin-product", productId],
    queryFn: () => getAdminProductService(productId),
    enabled: Boolean(productId),
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductInput) => createAdminProductService(data),
    onSuccess: () => {
      toast.success("Produk dibuat");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal membuat produk")),
  });
};

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductInput) =>
      updateAdminProductService(productId, data),
    onSuccess: () => {
      toast.success("Produk diperbarui");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui produk")),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteAdminProductService(productId),
    onSuccess: () => {
      toast.success("Produk dihapus");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus produk")),
  });
};

export type { AdminProductListParams, ProductStatus };
