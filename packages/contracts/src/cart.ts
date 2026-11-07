import { z } from "zod";
import { objectIdSchema } from "./common.js";
import type { ProductDto } from "./product.js";

export const cartItemInputSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type CartItemUpdate = z.infer<typeof cartItemUpdateSchema>;

export interface CartItemDto {
  product: ProductDto;
  quantity: number;
  lineTotal: number;
}

export interface CartDto {
  items: CartItemDto[];
  subtotal: number;
  itemCount: number;
}
