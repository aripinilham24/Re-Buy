import type { ApiSuccess, CategoryDto } from "@rebuy/contracts";
import api from "@/lib/axios";

export const listCategoriesService = async () => {
  const response = await api.get<ApiSuccess<CategoryDto[]>>("/categories");
  return response.data.data;
};

export const listAdminCategoriesService = async () => {
  const response =
    await api.get<ApiSuccess<CategoryDto[]>>("/admin/categories");
  return response.data.data;
};
