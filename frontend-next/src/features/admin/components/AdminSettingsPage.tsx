"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/errors";
import {
  getAdminSettingsService,
  updateAdminSettingsService,
} from "../services/adminServices";

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: getAdminSettingsService,
  });

  const update = useMutation({
    mutationFn: updateAdminSettingsService,
    onSuccess: () => {
      toast.success("Pengaturan disimpan");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menyimpan pengaturan")),
  });

  if (isLoading || !settings) {
    return <Skeleton className="h-48 w-full" />;
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    update.mutate({
      storeName: String(formData.get("storeName") ?? ""),
      storeDescription: String(formData.get("storeDescription") ?? ""),
      shippingFlatRate: Number(formData.get("shippingFlatRate") ?? 0),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/60 p-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="storeName">Nama toko</Label>
        <Input
          id="storeName"
          name="storeName"
          defaultValue={settings.storeName}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="storeDescription">Deskripsi toko</Label>
        <Input
          id="storeDescription"
          name="storeDescription"
          defaultValue={settings.storeDescription}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="shippingFlatRate">Ongkir flat (IDR)</Label>
        <Input
          id="shippingFlatRate"
          name="shippingFlatRate"
          type="number"
          min={0}
          defaultValue={settings.shippingFlatRate}
        />
      </div>
      <Button type="submit" disabled={update.isPending}>
        {update.isPending ? "Menyimpan..." : "Simpan pengaturan"}
      </Button>
    </form>
  );
}
