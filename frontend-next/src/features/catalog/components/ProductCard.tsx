import Image from "next/image";
import Link from "next/link";
import type { ProductDto } from "@rebuy/contracts";
import { conditionLabels, formatCurrency } from "@/lib/format";
import { WishlistButton } from "@/features/wishlist/components/WishlistButton";

export function ProductCard({ product }: { product: ProductDto }) {
  const image = product.images[0];

  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-800 bg-gray-800">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt ?? product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Tanpa gambar
            </div>
          )}
          {product.stock === 0 ? (
            <span className="absolute top-3 left-3 rounded-full bg-black/80 px-3 py-1 text-xs text-white">
              Terjual
            </span>
          ) : null}
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-xs tracking-wide text-green-400 uppercase">
            {product.category.name}
          </p>
          <h3 className="line-clamp-2 font-medium text-white">
            {product.name}
          </h3>
          <p className="text-lg font-semibold text-green-400">
            {formatCurrency(product.price)}
          </p>
          <p className="text-xs text-gray-400">
            {conditionLabels[product.condition] ?? product.condition} · Stok{" "}
            {product.stock}
          </p>
        </div>
      </Link>

      <div className="mt-2">
        <WishlistButton productId={product.productId} />
      </div>
    </article>
  );
}
