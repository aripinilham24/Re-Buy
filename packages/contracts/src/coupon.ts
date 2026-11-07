import { z } from "zod";

export const couponTypeSchema = z.enum(["percent", "fixed"]);

export const couponInputSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(30)
    .regex(/^[A-Z0-9_-]+$/, "Invalid coupon code"),
  type: couponTypeSchema,
  value: z.coerce.number().min(0),
  minSpend: z.coerce.number().int().min(0).default(0),
  maxDiscount: z.coerce.number().int().min(0).optional(),
  usageLimit: z.coerce.number().int().min(1).optional(),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = couponInputSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1),
});

export type CouponType = z.infer<typeof couponTypeSchema>;
export type CouponInput = z.infer<typeof couponInputSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

export interface CouponDto {
  couponId: string;
  code: string;
  type: CouponType;
  value: number;
  minSpend: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CouponValidationResult {
  couponId: string;
  code: string;
  discount: number;
}
