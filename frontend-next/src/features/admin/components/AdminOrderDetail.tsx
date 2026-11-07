"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OrderStatus } from "@rebuy/contracts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { orderStatusLabels } from "@/lib/order-status";
import {
  getAdminOrderService,
  updateAdminOrderStatusService,
} from "../services/orderAdminServices";

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

export function AdminOrderDetail() {
  const params = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", params.orderId],
    queryFn: () => getAdminOrderService(params.orderId),
  });

  const update = useMutation({
    mutationFn: (status: OrderStatus) =>
      updateAdminOrderStatusService(params.orderId, {
        status,
        note: note || undefined,
        trackingNumber: trackingNumber || undefined,
      }),
    onSuccess: () => {
      toast.success("Status pesanan diperbarui");
      queryClient.invalidateQueries({
        queryKey: ["admin-order", params.orderId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui status")),
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (isError || !order) {
    return (
      <EmptyState
        title="Pesanan tidak ditemukan"
        action={
          <Link href="/admin/orders" className="text-green-400 underline">
            Kembali
          </Link>
        }
      />
    );
  }

  const effectiveStatus = selectedStatus || order.status;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-green-400">
            ← Kembali
          </Link>
          <h2 className="mt-1 text-2xl font-bold text-white">
            {order.orderNumber}
          </h2>
          <p className="text-sm text-gray-400">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm">
          <h3 className="font-semibold text-white">Alamat</h3>
          <p className="text-gray-200">{order.address.recipientName}</p>
          <p className="text-gray-400">{order.address.phone}</p>
          <p className="text-gray-400">
            {order.address.street}, {order.address.city},{" "}
            {order.address.province}, {order.address.postalCode}
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm">
          <h3 className="font-semibold text-white">Total</h3>
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
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <h3 className="font-semibold text-white">Item</h3>
        {order.items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between border-b border-gray-800 py-2 text-sm last:border-0"
          >
            <span className="text-gray-200">
              {item.name} × {item.quantity}
            </span>
            <span className="text-white">
              {formatCurrency(item.lineTotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <h3 className="font-semibold text-white">Ubah status</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status baru</Label>
            <select
              id="status"
              value={effectiveStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as OrderStatus)
              }
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {orderStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tracking">Nomor resi</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="Opsional"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="note">Catatan</Label>
          <Input
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Opsional"
          />
        </div>
        <Button
          disabled={update.isPending || effectiveStatus === order.status}
          onClick={() => update.mutate(effectiveStatus)}
        >
          {update.isPending ? "Menyimpan..." : "Simpan status"}
        </Button>
      </div>
    </section>
  );
}
