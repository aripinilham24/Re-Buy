"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CouponInput, CouponType } from "@rebuy/contracts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";
import {
  createAdminCouponService,
  deleteAdminCouponService,
  listAdminCouponsService,
  updateAdminCouponService,
} from "../services/couponAdminServices";

export function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [type, setType] = useState<CouponType>("percent");
  const [value, setValue] = useState("10");
  const [minSpend, setMinSpend] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: listAdminCouponsService,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  };

  const create = useMutation({
    mutationFn: (data: CouponInput) => createAdminCouponService(data),
    onSuccess: () => {
      toast.success("Kupon dibuat");
      setCode("");
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal membuat kupon")),
  });

  const remove = useMutation({
    mutationFn: deleteAdminCouponService,
    onSuccess: () => {
      toast.success("Kupon dihapus");
      invalidate();
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus kupon")),
  });

  const toggle = useMutation({
    mutationFn: ({ couponId, isActive }: { couponId: string; isActive: boolean }) =>
      updateAdminCouponService(couponId, { isActive }),
    onSuccess: () => invalidate(),
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui kupon")),
  });

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CouponInput = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minSpend: Number(minSpend) || 0,
      perUserLimit: Number(perUserLimit) || 1,
      ...(maxDiscount ? { maxDiscount: Number(maxDiscount) } : {}),
      ...(usageLimit ? { usageLimit: Number(usageLimit) } : {}),
      ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
      ...(endsAt ? { endsAt: new Date(endsAt) } : {}),
    };

    create.mutate(payload);
  };

  return (
    <section className="space-y-6">
      <form
        onSubmit={submit}
        className="grid gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4 md:grid-cols-3"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-code">Kode</Label>
          <Input
            id="coupon-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="HEMAT10"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-type">Tipe</Label>
          <select
            id="coupon-type"
            value={type}
            onChange={(event) => setType(event.target.value as CouponType)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white"
          >
            <option value="percent">Persen</option>
            <option value="fixed">Nominal</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-value">Nilai</Label>
          <Input
            id="coupon-value"
            type="number"
            min={0}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-min">Min. belanja</Label>
          <Input
            id="coupon-min"
            type="number"
            min={0}
            value={minSpend}
            onChange={(event) => setMinSpend(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-max">Maks. diskon</Label>
          <Input
            id="coupon-max"
            type="number"
            min={0}
            value={maxDiscount}
            onChange={(event) => setMaxDiscount(event.target.value)}
            placeholder="Opsional"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-limit">Batas pemakaian</Label>
          <Input
            id="coupon-limit"
            type="number"
            min={1}
            value={usageLimit}
            onChange={(event) => setUsageLimit(event.target.value)}
            placeholder="Opsional"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-per-user">Batas per user</Label>
          <Input
            id="coupon-per-user"
            type="number"
            min={1}
            value={perUserLimit}
            onChange={(event) => setPerUserLimit(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-start">Mulai</Label>
          <Input
            id="coupon-start"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="coupon-end">Berakhir</Label>
          <Input
            id="coupon-end"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
          />
        </div>
        <div className="flex items-end md:col-span-3">
          <Button type="submit" disabled={create.isPending || !code.trim()}>
            {create.isPending ? "Menyimpan..." : "Tambah kupon"}
          </Button>
        </div>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-400">Memuat...</p>
      ) : coupons.length === 0 ? (
        <EmptyState title="Belum ada kupon" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3">Kode</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Nilai</th>
                <th className="px-4 py-3">Dipakai</th>
                <th className="px-4 py-3">Periode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.couponId}>
                  <td className="px-4 py-3 font-medium text-white">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.type === "percent" ? "Persen" : "Nominal"}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.type === "percent"
                      ? `${coupon.value}%`
                      : formatCurrency(coupon.value)}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.usedCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {coupon.startsAt ? formatDate(coupon.startsAt) : "—"} s/d{" "}
                    {coupon.endsAt ? formatDate(coupon.endsAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {coupon.isActive ? "Aktif" : "Nonaktif"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={toggle.isPending}
                        onClick={() =>
                          toggle.mutate({
                            couponId: coupon.couponId,
                            isActive: !coupon.isActive,
                          })
                        }
                      >
                        {coupon.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (window.confirm(`Hapus kupon ${coupon.code}?`)) {
                            remove.mutate(coupon.couponId);
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
    </section>
  );
}
