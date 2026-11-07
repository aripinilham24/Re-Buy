"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCategories } from "@/features/category/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: categories = [] } = useCategories();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const debouncedQ = useDebounce(q, 400);

  const updateParam = useCallback(
    (key: string, value?: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("cursor");
      router.replace(`${pathname}?${next.toString()}`);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (debouncedQ !== current) {
      updateParam("q", debouncedQ);
    }
  }, [debouncedQ, searchParams, updateParam]);

  const applyPrice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    if (minPrice) next.set("minPrice", minPrice);
    else next.delete("minPrice");
    if (maxPrice) next.set("maxPrice", maxPrice);
    else next.delete("maxPrice");
    next.delete("cursor");
    router.replace(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="catalog-search">Cari produk</Label>
          <Input
            id="catalog-search"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Nama atau deskripsi"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="catalog-category">Kategori</Label>
          <select
            id="catalog-category"
            value={searchParams.get("category") ?? ""}
            onChange={(event) =>
              updateParam("category", event.target.value || undefined)
            }
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="catalog-condition">Kondisi</Label>
          <select
            id="catalog-condition"
            value={searchParams.get("condition") ?? ""}
            onChange={(event) =>
              updateParam("condition", event.target.value || undefined)
            }
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Semua kondisi</option>
            <option value="new">Baru</option>
            <option value="like_new">Seperti baru</option>
            <option value="good">Baik</option>
            <option value="fair">Cukup</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="catalog-sort">Urutkan</Label>
          <select
            id="catalog-sort"
            value={searchParams.get("sort") ?? "newest"}
            onChange={(event) =>
              updateParam("sort", event.target.value || undefined)
            }
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga terendah</option>
            <option value="price_desc">Harga tertinggi</option>
          </select>
        </div>
      </div>

      <form
        onSubmit={applyPrice}
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="catalog-min-price">Harga minimum</Label>
          <Input
            id="catalog-min-price"
            type="number"
            min={0}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="catalog-max-price">Harga maksimum</Label>
          <Input
            id="catalog-max-price"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="w-40"
          />
        </div>
        <Button type="submit" variant="outline">
          Terapkan harga
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.replace(pathname)}
        >
          Reset
        </Button>
      </form>
    </div>
  );
}
