"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductStatus } from "@rebuy/contracts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import {
  useAdminProducts,
  useDeleteProduct,
} from "../hooks/useAdminProducts";

const statusLabels: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Aktif",
  sold: "Terjual",
  archived: "Diarsipkan",
};

export function AdminProductsPage() {
  const [status, setStatus] = useState<ProductStatus | "">("");
  const query = useAdminProducts({
    limit: 50,
    status: status || undefined,
  });
  const remove = useDeleteProduct();

  const products = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label htmlFor="status-filter" className="text-sm text-gray-400">
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ProductStatus | "")
            }
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white"
          >
            <option value="">Semua</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <Button asChild>
          <Link href="/admin/products/new">Tambah produk</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState
          title="Gagal memuat produk"
          description="Silakan coba lagi."
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Tambahkan produk pertama untuk mulai berjualan."
          action={
            <Button asChild>
              <Link href="/admin/products/new">Tambah produk</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {products.map((product) => (
                <tr key={product.productId}>
                  <td className="px-4 py-3">{product.name}</td>
                  <td className="px-4 py-3">{product.category.name}</td>
                  <td className="px-4 py-3">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    {statusLabels[product.status]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/admin/products/${product.productId}/edit`}
                        >
                          Edit
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Hapus produk "${product.name}"? Tindakan ini tidak bisa dibatalkan.`,
                            )
                          ) {
                            remove.mutate(product.productId);
                          }
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {query.hasNextPage ? (
        <Button
          variant="outline"
          onClick={() => query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
        >
          {query.isFetchingNextPage ? "Memuat..." : "Muat lebih banyak"}
        </Button>
      ) : null}
    </section>
  );
}
