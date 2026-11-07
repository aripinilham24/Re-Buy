"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { AddressInput } from "@rebuy/contracts";
import { addressInputSchema } from "@rebuy/contracts";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AddressFormValues = z.input<typeof addressInputSchema>;

interface AddressFormProps {
  onSubmit: (data: AddressInput) => Promise<void> | void;
  onCancel?: () => void;
  loading?: boolean;
}

export function AddressForm({
  onSubmit,
  onCancel,
  loading,
}: AddressFormProps) {
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: {
      label: "Rumah",
      recipientName: "",
      phone: "",
      street: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
      isDefault: false,
    },
  });

  const submit = form.handleSubmit(async (values) => {
    const parsed = addressInputSchema.parse({
      ...values,
      notes: values.notes || undefined,
    });
    await onSubmit(parsed);
    form.reset();
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Label"
          error={form.formState.errors.label?.message}
          {...form.register("label")}
        />
        <FormField
          label="Nama penerima"
          error={form.formState.errors.recipientName?.message}
          {...form.register("recipientName")}
        />
        <FormField
          label="Telepon"
          error={form.formState.errors.phone?.message}
          {...form.register("phone")}
        />
        <FormField
          label="Kode pos"
          error={form.formState.errors.postalCode?.message}
          {...form.register("postalCode")}
        />
        <FormField
          label="Kota"
          error={form.formState.errors.city?.message}
          {...form.register("city")}
        />
        <FormField
          label="Provinsi"
          error={form.formState.errors.province?.message}
          {...form.register("province")}
        />
      </div>

      <FormField
        label="Alamat lengkap"
        error={form.formState.errors.street?.message}
        {...form.register("street")}
      />
      <FormField
        label="Catatan"
        error={form.formState.errors.notes?.message}
        {...form.register("notes")}
      />

      <div className="flex items-center gap-3">
        <Input
          id="isDefault"
          type="checkbox"
          className="h-4 w-4"
          {...form.register("isDefault")}
        />
        <Label htmlFor="isDefault">Jadikan alamat utama</Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan alamat"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        ) : null}
      </div>
    </form>
  );
}
