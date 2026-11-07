import type { ProductDto } from "./product.js";

export interface WishlistItemDto {
  wishlistId: string;
  product: ProductDto;
  addedAt: string;
}
