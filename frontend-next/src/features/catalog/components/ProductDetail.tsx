"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { conditionLabels, formatCurrency } from "@/lib/format";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";
import { useProduct } from "../hooks/useProducts";
import { ProductGallery } from "./ProductGallery";

export function ProductDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: product, isLoading, isError } = useProduct(slug);

  if (isLoading) {
    return (
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16">
        <EmptyState
          title="Produk tidak ditemukan"
          description="Produk mungkin sudah terjual atau tidak lagi tersedia."
          action={
            <Link href="/products" className="text-green-400 underline">
              Kembali ke katalog
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
      <ProductGallery images={product.images} name={product.name} />

      <div className="space-y-5">
        <div className="space-y-2">
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-xs tracking-wide text-green-400 uppercase"
          >
            {product.category.name}
          </Link>
          <h1 className="text-3xl font-bold text-white">{product.name}</h1>
          <p className="text-2xl font-semibold text-green-400">
            {formatCurrency(product.price)}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm">
          <div>
            <dt className="text-gray-400">Kondisi</dt>
            <dd className="text-white">
              {conditionLabels[product.condition] ?? product.condition}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400">Stok</dt>
            <dd className="text-white">{product.stock}</dd>
          </div>
          {product.location ? (
            <div>
              <dt className="text-gray-400">Lokasi</dt>
              <dd className="text-white">{product.location}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-gray-400">Terjual</dt>
            <dd className="text-white">{product.soldCount}</dd>
          </div>
        </dl>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white">Deskripsi</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">
            {product.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <WishlistButton productId={product.productId} />
        </div>
      </div>
    </main>
  );
}
