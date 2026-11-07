"use client";

import { ProductGrid } from "@/features/catalog/components/ProductGrid";
import { useWishlist } from "../hooks/useWishlist";

export function WishlistPage() {
  const { data = [], isLoading, isError } = useWishlist();

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Wishlist</h1>
        <p className="text-sm text-gray-400">
          Produk yang kamu simpan untuk nanti.
        </p>
      </header>

      <ProductGrid
        products={data.map((item) => item.product)}
        isLoading={isLoading}
        isError={isError}
        emptyTitle="Wishlist masih kosong"
        emptyDescription="Simpan produk favorit dari katalog."
      />
    </main>
  );
}
