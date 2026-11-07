"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { OrderStatus } from "@rebuy/contracts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { orderStatusLabels } from "@/lib/order-status";
import { listAdminOrdersService } from "../services/orderAdminServices";

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

export function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "">("");

  const query = useInfiniteQuery({
    queryKey: ["admin-orders", status],
    queryFn: ({ pageParam }) =>
      listAdminOrdersService({
        limit: 30,
        status: status || undefined,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
  });

  const orders = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Pesanan</h2>
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
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : query.isError ? (
        <EmptyState title="Gagal memuat pesanan" />
      ) : orders.length === 0 ? (
        <EmptyState title="Belum ada pesanan" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td className="px-4 py-3">{order.orderNumber}</td>
                  <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(order.grandTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/orders/${order.orderId}`}>
                        Detail
                      </Link>
                    </Button>
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
