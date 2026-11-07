"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/features/catalog/components/ProductGrid";
import { useInfiniteProducts } from "@/features/catalog/hooks/useProducts";
import { useCategories } from "@/features/category/hooks/useCategories";

export function HomePage() {
  const productsQuery = useInfiniteProducts({ sort: "newest" });
  const { data: categories = [] } = useCategories();

  const products =
    productsQuery.data?.pages.flatMap((page) => page.items).slice(0, 8) ??
    [];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-10">
      <section className="grid gap-6 rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-gray-900 to-gray-950 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-12">
        <div className="space-y-5">
          <p className="text-sm font-medium tracking-wide text-green-400 uppercase">
            Sustainable marketplace · SDG 12
          </p>
          <h1 className="text-4xl leading-tight font-bold text-white md:text-5xl">
            Belanja bekas,
            <br />
            hidupkan lagi.
          </h1>
          <p className="max-w-xl text-gray-300">
            Temukan barang berkualitas dengan harga lebih baik. Setiap pembelian
            membantu mengurangi limbah dan memperpanjang umur produk.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/products">Jelajahi katalog</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Mulai jual beli</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 self-center">
          {[
            ["1 barang", "1 peluang"],
            ["Harga", "lebih ramah"],
            ["Kualitas", "terkurasi"],
            ["Ramah", "lingkungan"],
          ].map(([title, subtitle]) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4"
            >
              <p className="text-lg font-semibold text-green-400">{title}</p>
              <p className="text-sm text-gray-400">{subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Kategori</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.categoryId}
                href={`/products?category=${category.slug}`}
                className="rounded-full border border-gray-800 bg-gray-900/60 px-4 py-2 text-sm text-gray-200 transition hover:border-green-500/50 hover:text-green-400"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">Produk terbaru</h2>
            <p className="text-sm text-gray-400">
              Barang baru masuk dari katalog Re:Buy.
            </p>
          </div>
          <Link href="/products" className="text-sm text-green-400">
            Lihat semua
          </Link>
        </div>

        <ProductGrid
          products={products}
          isLoading={productsQuery.isLoading}
          isError={productsQuery.isError}
        />
      </section>
    </main>
  );
}
