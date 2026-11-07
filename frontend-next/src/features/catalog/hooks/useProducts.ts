import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getProductService,
  listProductsService,
  type CatalogFilters,
} from "../services/catalogServices";

export const useInfiniteProducts = (filters: CatalogFilters) =>
  useInfiniteQuery({
    queryKey: ["products", filters],
    queryFn: ({ pageParam }) => listProductsService(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
  });

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductService(slug),
    enabled: Boolean(slug),
  });
