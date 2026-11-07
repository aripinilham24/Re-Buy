"use client";

import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { orderStatusLabels } from "@/lib/order-status";
import { getAdminStatsService } from "../services/adminServices";

const statCards = [
  { key: "revenue", label: "Pendapatan" },
  { key: "totalOrders", label: "Total pesanan" },
  { key: "totalUsers", label: "Total user" },
  { key: "totalProducts", label: "Total produk" },
] as const;

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStatsService,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return <EmptyState title="Gagal memuat statistik" />;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"
          >
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {card.key === "revenue"
                ? formatCurrency(stats.revenue)
                : stats[card.key]}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <h2 className="mb-3 font-semibold text-white">
            Pesanan per status
          </h2>
          <div className="space-y-2 text-sm">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between text-gray-300">
                <span>
                  {orderStatusLabels[
                    status as keyof typeof orderStatusLabels
                  ] ?? status}
                </span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <h2 className="mb-3 font-semibold text-white">Stok rendah</h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-gray-400">Semua stok aman.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {stats.lowStock.map((product) => (
                <div
                  key={product.productId}
                  className="flex justify-between text-gray-300"
                >
                  <span>{product.name}</span>
                  <span className="text-red-300">{product.stock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <h2 className="mb-3 font-semibold text-white">Produk terlaris</h2>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada penjualan.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="py-2">Produk</th>
                <th className="py-2">Terjual</th>
                <th className="py-2 text-right">Pendapatan</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {stats.topProducts.map((product) => (
                <tr key={product.productId}>
                  <td className="py-2">{product.name}</td>
                  <td className="py-2">{product.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
