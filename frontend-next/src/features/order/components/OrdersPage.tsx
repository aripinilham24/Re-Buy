"use client";

import { useState } from "react";
import Link from "next/link";
import type { OrderStatus } from "@rebuy/contracts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { orderStatusLabels } from "@/lib/order-status";
import { useOrders } from "../hooks/useOrders";

const statuses: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "expired",
  "refunded",
];

export function OrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const query = useOrders({ limit: 20, status: status || undefined });
  const orders = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Pesanan</h1>
          <p className="text-sm text-gray-400">Riwayat transaksi kamu.</p>
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as OrderStatus | "")
          }
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white"
        >
          <option value="">Semua status</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {orderStatusLabels[value]}
            </option>
          ))}
        </select>
      </header>

      {query.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState title="Gagal memuat pesanan" />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan"
          description="Pesanan yang kamu buat akan muncul di sini."
          action={
            <Button asChild>
              <Link href="/products">Belanja sekarang</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.orderId}
              href={`/orders/${order.orderId}`}
              className="block rounded-xl border border-gray-800 bg-gray-900/60 p-4 transition hover:border-green-500/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatDate(order.createdAt)} · {order.items.length} item
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold text-green-400">
                    {formatCurrency(order.grandTotal)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {query.hasNextPage ? (
        <div className="flex justify-center">
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
