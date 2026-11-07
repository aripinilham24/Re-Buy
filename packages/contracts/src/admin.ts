import { z } from "zod";
import { orderStatusSchema, roleSchema } from "./common.js";

export const adminUserListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  q: z.string().trim().max(100).optional(),
});

export const updateAdminUserSchema = z.object({
  isBlocked: z.boolean().optional(),
  role: roleSchema.optional(),
});

export const updateSettingsSchema = z.object({
  storeName: z.string().trim().min(2).max(100).optional(),
  storeDescription: z.string().trim().max(500).optional(),
  shippingFlatRate: z.coerce.number().int().min(0).optional(),
});

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export interface AdminUserDto {
  userId: string;
  username: string;
  email: string;
  role: z.infer<typeof roleSchema>;
  isBlocked: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminSettingsDto {
  storeName: string;
  storeDescription?: string;
  shippingFlatRate: number;
  updatedAt?: string;
}

export interface AdminTopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface AdminLowStockProduct {
  productId: string;
  name: string;
  stock: number;
}

export interface AdminStatsDto {
  revenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  ordersByStatus: Record<z.infer<typeof orderStatusSchema>, number>;
  topProducts: AdminTopProduct[];
  lowStock: AdminLowStockProduct[];
}
