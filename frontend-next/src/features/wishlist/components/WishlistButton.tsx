"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { useWishlist, useWishlistMutations } from "../hooks/useWishlist";

export function WishlistButton({ productId }: { productId: string }) {
  const user = useAuthStore((state) => state.user);
  const { data } = useWishlist(Boolean(user));
  const { add, remove } = useWishlistMutations();

  const isWishlisted = Boolean(
    data?.some((item) => item.product.productId === productId),
  );

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">Wishlist</Link>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isWishlisted ? "default" : "outline"}
      size="sm"
      disabled={add.isPending || remove.isPending}
      onClick={() =>
        isWishlisted ? remove.mutate(productId) : add.mutate(productId)
      }
    >
      {isWishlisted ? "Tersimpan" : "Wishlist"}
    </Button>
  );
}
