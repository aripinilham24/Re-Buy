import type {
  ApiSuccess,
  PresignUploadInput,
  PresignUploadResult,
  ProductDto,
  ProductInput,
  ProductStatus,
  UpdateProductInput,
} from "@rebuy/contracts";
import axios from "axios";
import api from "@/lib/axios";

export interface AdminProductListParams {
  limit?: number;
  cursor?: string;
  status?: ProductStatus;
}

export const listAdminProductsService = async (
  params: AdminProductListParams,
) => {
  const response = await api.get<ApiSuccess<ProductDto[]>>("/admin/products", {
    params,
  });

  return {
    items: response.data.data,
    meta: response.data.meta,
  };
};

export const getAdminProductService = async (productId: string) => {
  const response = await api.get<ApiSuccess<ProductDto>>(
    `/admin/products/${productId}`,
  );
  return response.data.data;
};

export const createAdminProductService = async (data: ProductInput) => {
  const response = await api.post<ApiSuccess<ProductDto>>(
    "/admin/products",
    data,
  );
  return response.data.data;
};

export const updateAdminProductService = async (
  productId: string,
  data: UpdateProductInput,
) => {
  const response = await api.patch<ApiSuccess<ProductDto>>(
    `/admin/products/${productId}`,
    data,
  );
  return response.data.data;
};

export const deleteAdminProductService = async (productId: string) => {
  await api.delete(`/admin/products/${productId}`);
};

export const presignUploadService = async (data: PresignUploadInput) => {
  const response = await api.post<ApiSuccess<PresignUploadResult>>(
    "/uploads/presign",
    data,
  );
  return response.data.data;
};

export const uploadFileToStorage = async (uploadUrl: string, file: File) => {
  await axios.put(uploadUrl, file, {
    headers: { "Content-Type": file.type },
  });
};
