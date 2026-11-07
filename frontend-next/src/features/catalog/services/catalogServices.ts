import type {
  ApiSuccess,
  ProductCondition,
  ProductDto,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export interface CatalogFilters {
  q?: string;
  category?: string;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
}

export const listProductsService = async (
  filters: CatalogFilters,
  cursor?: string,
) => {
  const response = await api.get<ApiSuccess<ProductDto[]>>("/products", {
    params: { ...filters, cursor },
  });

  return {
    items: response.data.data,
    meta: response.data.meta,
  };
};

export const getProductService = async (slug: string) => {
  const response = await api.get<ApiSuccess<ProductDto>>(
    `/products/${encodeURIComponent(slug)}`,
  );
  return response.data.data;
};
