"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { useAddToCart } from "../hooks/useCart";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
}

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const user = useAuthStore((state) => state.user);
  const add = useAddToCart();

  if (!user) {
    return (
      <Button asChild>
        <Link href="/login?next=/products">Masuk untuk membeli</Link>
      </Button>
    );
  }

  return (
    <Button
      disabled={stock === 0 || add.isPending}
      onClick={() => add.mutate({ productId, quantity: 1 })}
    >
      {stock === 0
        ? "Stok habis"
        : add.isPending
          ? "Menambahkan..."
          : "Tambah ke keranjang"}
    </Button>
  );
}
