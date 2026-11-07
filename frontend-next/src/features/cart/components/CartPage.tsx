"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "../hooks/useCart";

export function CartPage() {
  const { data: cart, isLoading, isError } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
        <Skeleton className="h-9 w-1/4" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </main>
    );
  }

  if (isError || !cart) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <EmptyState title="Gagal memuat keranjang" />
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <EmptyState
          title="Keranjang masih kosong"
          description="Jelajahi katalog dan tambahkan produk."
          action={
            <Button asChild>
              <Link href="/products">Lihat katalog</Link>
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Keranjang</h1>

        {cart.items.map((item) => (
          <article
            key={item.product.productId}
            className="flex gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4"
          >
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-800">
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0].url}
                  alt={item.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-3">
              <div>
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-medium text-white"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-green-400">
                  {formatCurrency(item.product.price)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={item.quantity <= 1 || updateItem.isPending}
                    onClick={() =>
                      updateItem.mutate({
                        productId: item.product.productId,
                        quantity: item.quantity - 1,
                      })
                    }
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-white">
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      item.quantity >= item.product.stock ||
                      updateItem.isPending
                    }
                    onClick={() =>
                      updateItem.mutate({
                        productId: item.product.productId,
                        quantity: item.quantity + 1,
                      })
                    }
                  >
                    +
                  </Button>
                </div>

                <span className="text-sm text-gray-400">
                  Subtotal {formatCurrency(item.lineTotal)}
                </span>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  disabled={removeItem.isPending}
                  onClick={() =>
                    removeItem.mutate(item.product.productId)
                  }
                >
                  Hapus
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="h-fit space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-lg font-semibold text-white">Ringkasan</h2>
        <div className="flex justify-between text-sm text-gray-300">
          <span>Subtotal</span>
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-300">
          <span>Jumlah item</span>
          <span>{cart.itemCount}</span>
        </div>
        <Button asChild className="w-full">
          <Link href="/checkout">Lanjut ke checkout</Link>
        </Button>
      </aside>
    </main>
  );
}
