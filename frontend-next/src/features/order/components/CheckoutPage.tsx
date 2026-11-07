"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import { useAddresses } from "@/features/address/hooks/useAddresses";
import { useCart } from "@/features/cart/hooks/useCart";
import { validateCouponService } from "@/features/coupon/services/couponServices";
import { useCheckout, useQuote } from "../hooks/useOrders";

export function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [notes, setNotes] = useState("");

  const quote = useQuote(
    appliedCoupon || undefined,
    Boolean(cart && cart.items.length > 0),
  );
  const checkout = useCheckout();

  const defaultAddressId =
    addresses.find((address) => address.isDefault)?.addressId ??
    addresses[0]?.addressId ??
    "";
  const effectiveAddressId = selectedAddressId ?? defaultAddressId;

  const couponMutation = useMutation({
    mutationFn: validateCouponService,
    onSuccess: (result) => {
      setAppliedCoupon(result.code);
      toast.success(`Kupon ${result.code} diterapkan`);
    },
    onError: (error) => {
      setAppliedCoupon("");
      toast.error(getErrorMessage(error, "Kupon tidak valid"));
    },
  });

  if (cartLoading || addressesLoading) {
    return (
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <EmptyState
          title="Keranjang kosong"
          description="Tambahkan produk sebelum checkout."
          action={
            <Button asChild>
              <Link href="/products">Lihat katalog</Link>
            </Button>
          }
        />
      </main>
    );
  }

  const subtotal = quote.data?.subtotal ?? cart.subtotal;
  const discount = quote.data?.discount ?? 0;
  const shippingCost = quote.data?.shippingCost ?? 0;
  const grandTotal = quote.data?.grandTotal ?? subtotal;

  const placeOrder = async () => {
    if (!effectiveAddressId) {
      toast.error("Pilih alamat pengiriman");
      return;
    }

    try {
      const result = await checkout.mutateAsync({
        addressId: effectiveAddressId,
        couponCode: appliedCoupon || undefined,
        notes: notes || undefined,
      });
      toast.success("Pesanan dibuat");
      router.push(`/orders/${result.order.orderId}`);
    } catch {
      // The mutation already surfaces a toast.
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <section className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Checkout</h1>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Alamat pengiriman
            </h2>
            <Link href="/profile" className="text-sm text-green-400">
              Kelola alamat
            </Link>
          </div>

          {addresses.length === 0 ? (
            <EmptyState
              title="Belum ada alamat"
              description="Tambahkan alamat terlebih dahulu."
              action={
                <Button asChild>
                  <Link href="/profile">Tambah alamat</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3">
              {addresses.map((address) => (
                <label
                  key={address.addressId}
                  className="flex cursor-pointer gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-sm"
                >
                  <input
                    type="radio"
                    name="address"
                    value={address.addressId}
                    checked={effectiveAddressId === address.addressId}
                    onChange={() => setSelectedAddressId(address.addressId)}
                    className="mt-1"
                  />
                  <span className="space-y-1">
                    <span className="block font-semibold text-white">
                      {address.label} · {address.recipientName}
                    </span>
                    <span className="block text-gray-400">
                      {address.phone}
                    </span>
                    <span className="block text-gray-400">
                      {address.street}, {address.city}, {address.province},{" "}
                      {address.postalCode}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
          <h2 className="text-lg font-semibold text-white">Kupon</h2>
          <div className="flex gap-3">
            <Input
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value)}
              placeholder="Kode kupon"
              className="max-w-xs"
            />
            <Button
              type="button"
              variant="outline"
              disabled={couponMutation.isPending || !couponInput.trim()}
              onClick={() => couponMutation.mutate(couponInput.trim())}
            >
              {couponMutation.isPending ? "Memeriksa..." : "Terapkan"}
            </Button>
            {appliedCoupon ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAppliedCoupon("");
                  setCouponInput("");
                }}
              >
                Hapus
              </Button>
            ) : null}
          </div>
          {appliedCoupon ? (
            <p className="text-sm text-green-400">
              Kupon {appliedCoupon} aktif
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Catatan pesanan</Label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-white outline-none"
            placeholder="Opsional"
          />
        </div>
      </section>

      <aside className="h-fit space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-lg font-semibold text-white">Ringkasan</h2>

        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Diskon</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ongkir</span>
            <span>
              {quote.isLoading ? "Menghitung..." : formatCurrency(shippingCost)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-800 pt-2 text-base font-semibold text-white">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={
            checkout.isPending ||
            !effectiveAddressId ||
            quote.isLoading ||
            addresses.length === 0
          }
          onClick={placeOrder}
        >
          {checkout.isPending ? "Memproses..." : "Buat pesanan"}
        </Button>
      </aside>
    </main>
  );
}
