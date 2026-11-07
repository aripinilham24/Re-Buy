"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductDto, ProductInput } from "@rebuy/contracts";
import { productInputSchema } from "@rebuy/contracts";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/features/category/hooks/useCategories";
import {
  useCreateProduct,
  useUpdateProduct,
} from "../hooks/useAdminProducts";
import { ImageUploader } from "./ImageUploader";

type ProductFormValues = z.input<typeof productInputSchema>;

const toFormValues = (product?: ProductDto): ProductFormValues => ({
  name: product?.name ?? "",
  description: product?.description ?? "",
  categoryId: product?.category.categoryId ?? "",
  condition: product?.condition ?? "good",
  price: product?.price ?? 0,
  stock: product?.stock ?? 1,
  images:
    product?.images.map((image) => ({
      key: image.key,
      alt: image.alt,
      order: image.order,
    })) ?? [],
  status: product?.status ?? "draft",
  isFeatured: product?.isFeatured ?? false,
  location: product?.location ?? "",
});

export function AdminProductForm({ product }: { product?: ProductDto }) {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.productId ?? "new");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productInputSchema),
    defaultValues: toFormValues(product),
  });

  useEffect(() => {
    if (product) form.reset(toFormValues(product));
  }, [product, form]);

  const images = useWatch({ control: form.control, name: "images" }) ?? [];
  const saving = createProduct.isPending || updateProduct.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = productInputSchema.parse(values);
    const payload: ProductInput = {
      ...parsed,
      location: parsed.location || undefined,
    };

    try {
      if (product) {
        await updateProduct.mutateAsync(payload);
      } else {
        await createProduct.mutateAsync(payload);
      }
      router.push("/admin/products");
    } catch {
      // Hooks already surface a toast.
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormField
        label="Nama produk"
        error={form.formState.errors.name?.message}
        {...form.register("name")}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Deskripsi</Label>
        <textarea
          id="description"
          rows={6}
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="categoryId">Kategori</Label>
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <select
                id="categoryId"
                value={field.value}
                onChange={field.onChange}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none"
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          />
          {form.formState.errors.categoryId ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.categoryId.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="condition">Kondisi</Label>
          <Controller
            control={form.control}
            name="condition"
            render={({ field }) => (
              <select
                id="condition"
                value={field.value}
                onChange={field.onChange}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none"
              >
                <option value="new">Baru</option>
                <option value="like_new">Seperti baru</option>
                <option value="good">Baik</option>
                <option value="fair">Cukup</option>
              </select>
            )}
          />
        </div>

        <FormField
          label="Harga (IDR)"
          type="number"
          min={0}
          error={form.formState.errors.price?.message}
          {...form.register("price", { valueAsNumber: true })}
        />
        <FormField
          label="Stok"
          type="number"
          min={0}
          error={form.formState.errors.stock?.message}
          {...form.register("stock", { valueAsNumber: true })}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <select
                id="status"
                value={field.value}
                onChange={field.onChange}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-white outline-none"
              >
                <option value="draft">Draft</option>
                <option value="active">Aktif</option>
                <option value="sold">Terjual</option>
                <option value="archived">Diarsipkan</option>
              </select>
            )}
          />
        </div>

        <FormField
          label="Lokasi"
          error={form.formState.errors.location?.message}
          {...form.register("location")}
        />
      </div>

      <div className="flex items-center gap-3">
        <Input
          id="isFeatured"
          type="checkbox"
          className="h-4 w-4"
          {...form.register("isFeatured")}
        />
        <Label htmlFor="isFeatured">Tampilkan sebagai produk unggulan</Label>
      </div>

      <div className="space-y-2">
        <Label>Gambar produk</Label>
        <ImageUploader
          images={images}
          initialImages={product?.images}
          onChange={(nextImages) =>
            form.setValue("images", nextImages, { shouldValidate: true })
          }
        />
        {form.formState.errors.images ? (
          <p className="text-sm text-destructive">
            Minimal satu gambar diperlukan
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving
            ? "Menyimpan..."
            : product
              ? "Simpan perubahan"
              : "Buat produk"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
