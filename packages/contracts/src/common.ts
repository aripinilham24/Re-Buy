import { z } from "zod";

export const roleSchema = z.enum(["user", "admin"]);
export type Role = z.infer<typeof roleSchema>;

export const orderStatusSchema = z.enum([
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "expired",
  "refunded",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const productStatusSchema = z.enum([
  "draft",
  "active",
  "sold",
  "archived",
]);
export type ProductStatus = z.infer<typeof productStatusSchema>;

export const productConditionSchema = z.enum([
  "new",
  "like_new",
  "good",
  "fair",
]);
export type ProductCondition = z.infer<typeof productConditionSchema>;

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
