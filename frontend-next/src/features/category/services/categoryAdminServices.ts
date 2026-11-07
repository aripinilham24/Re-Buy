import type { ApiSuccess, CategoryDto } from "@rebuy/contracts";
import api from "@/lib/axios";

export const createAdminCategoryService = async (name: string) => {
  const response = await api.post<ApiSuccess<CategoryDto>>(
    "/admin/categories",
    { name },
  );
  return response.data.data;
};

export const deleteAdminCategoryService = async (categoryId: string) => {
  await api.delete(`/admin/categories/${categoryId}`);
};
