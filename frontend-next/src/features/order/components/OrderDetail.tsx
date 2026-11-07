"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { orderStatusLabels } from "@/lib/order-status";
import { useCancelOrder, useOrder } from "../hooks/useOrders";

export function OrderDetail() {
  const params = useParams<{ orderId: string }>();
  const { data: order, isLoading, isError } = useOrder(params.orderId);
  const cancel = useCancelOrder();

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (isError || !order) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-16">
        <EmptyState
          title="Pesanan tidak ditemukan"
          action={
            <Link href="/orders" className="text-green-400 underline">
              Kembali ke pesanan
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/orders" className="text-sm text-green-400">
            ← Kembali
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-white">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-gray-400">
            Dibuat {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      <section className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <h2 className="text-lg font-semibold text-white">Item</h2>
        {order.items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 border-b border-gray-800 py-3 last:border-0"
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-800">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex-1">
              <Link
                href={`/products/${item.slug}`}
                className="font-medium text-white"
              >
                {item.name}
              </Link>
              <p className="text-sm text-gray-400">
                {item.quantity} x {formatCurrency(item.price)}
              </p>
            </div>
            <span className="text-white">
              {formatCurrency(item.lineTotal)}
            </span>
          </div>
        ))}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm">
          <h2 className="text-lg font-semibold text-white">
            Alamat pengiriman
          </h2>
          <p className="text-gray-200">{order.address.recipientName}</p>
          <p className="text-gray-400">{order.address.phone}</p>
          <p className="text-gray-400">
            {order.address.street}, {order.address.city},{" "}
            {order.address.province}, {order.address.postalCode}
          </p>
          {order.trackingNumber ? (
            <p className="text-gray-300">
              Resi: {order.trackingNumber}
            </p>
          ) : null}
        </section>

        <section className="space-y-2 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm">
          <h2 className="text-lg font-semibold text-white">Pembayaran</h2>
          <div className="flex justify-between text-gray-300">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Diskon</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Ongkir</span>
            <span>{formatCurrency(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-800 pt-2 font-semibold text-white">
            <span>Total</span>
            <span>{formatCurrency(order.grandTotal)}</span>
          </div>
          {order.coupon ? (
            <p className="text-xs text-green-400">
              Kupon: {order.coupon.code}
            </p>
          ) : null}
        </section>
      </div>

      <section className="space-y-2 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <h2 className="text-lg font-semibold text-white">Riwayat status</h2>
        <ol className="space-y-2 text-sm">
          {order.statusHistory.map((entry, index) => (
            <li key={`${entry.status}-${index}`} className="flex gap-3">
              <span className="w-40 text-gray-400">
                {formatDate(entry.at)}
              </span>
              <span className="text-white">
                {orderStatusLabels[entry.status]}
              </span>
              {entry.note ? (
                <span className="text-gray-500">{entry.note}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {order.status === "pending_payment" ? (
        <Button
          variant="destructive"
          disabled={cancel.isPending}
          onClick={() => {
            if (window.confirm("Batalkan pesanan ini?")) {
              cancel.mutate(order.orderId);
            }
          }}
        >
          {cancel.isPending ? "Membatalkan..." : "Batalkan pesanan"}
        </Button>
      ) : null}
    </main>
  );
}
