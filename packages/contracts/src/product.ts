import { z } from "zod";
import {
  objectIdSchema,
  productConditionSchema,
  productStatusSchema,
} from "./common.js";

export const productImageInputSchema = z.object({
  key: z.string().trim().min(1),
  alt: z.string().trim().max(150).optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug")
    .max(140)
    .optional(),
  description: z.string().trim().min(10).max(5000),
  categoryId: objectIdSchema,
  condition: productConditionSchema,
  price: z.coerce.number().int().min(0),
  stock: z.coerce.number().int().min(0).default(1),
  images: z.array(productImageInputSchema).min(1).max(8),
  status: productStatusSchema.default("draft"),
  isFeatured: z.boolean().optional(),
  location: z.string().trim().max(100).optional(),
});

export const updateProductSchema = productInputSchema.partial();

export const productListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
  cursor: z.string().optional(),
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  condition: productConditionSchema.optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
});

export const adminProductListQuerySchema = productListQuerySchema.extend({
  status: productStatusSchema.optional(),
});

export type ProductImageInput = z.infer<typeof productImageInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;

export interface ProductImageDto {
  key: string;
  url: string;
  alt?: string;
  order: number;
}

export interface CategorySummary {
  categoryId: string;
  name: string;
  slug: string;
}

export interface ProductDto {
  productId: string;
  name: string;
  slug: string;
  description: string;
  category: CategorySummary;
  condition: z.infer<typeof productConditionSchema>;
  price: number;
  stock: number;
  images: ProductImageDto[];
  status: z.infer<typeof productStatusSchema>;
  isFeatured: boolean;
  location?: string;
  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResult {
  items: ProductDto[];
  nextCursor: string | null;
  hasMore: boolean;
}
