"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useInfiniteProducts } from "../hooks/useProducts";
import type { CatalogFilters as Filters } from "../services/catalogServices";
import { CatalogFilters } from "./CatalogFilters";
import { ProductGrid } from "./ProductGrid";

export function ProductsPage() {
  const searchParams = useSearchParams();

  const filters = useMemo<Filters>(() => {
    const sort = searchParams.get("sort");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    return {
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      condition:
        (searchParams.get("condition") as Filters["condition"]) ?? undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort:
        sort === "price_asc" || sort === "price_desc"
          ? sort
          : "newest",
    };
  }, [searchParams]);

  const query = useInfiniteProducts(filters);
  const products = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Katalog</h1>
        <p className="text-sm text-gray-400">
          Barang bekas berkualitas dengan harga bersahabat.
        </p>
      </header>

      <CatalogFilters />

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{products.length} produk ditampilkan</span>
      </div>

      <ProductGrid
        products={products}
        isLoading={query.isLoading}
        isError={query.isError}
      />

      {query.hasNextPage ? (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? "Memuat..." : "Muat lebih banyak"}
          </Button>
        </div>
      ) : null}
    </main>
  );
}
