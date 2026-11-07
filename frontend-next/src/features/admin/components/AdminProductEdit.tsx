"use client";

import { useParams } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProduct } from "../hooks/useAdminProducts";
import { AdminProductForm } from "./AdminProductForm";

export function AdminProductEdit() {
  const params = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useAdminProduct(params.id);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !product) {
    return <EmptyState title="Produk tidak ditemukan" />;
  }

  return <AdminProductForm product={product} />;
}
