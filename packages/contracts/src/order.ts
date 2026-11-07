import { z } from "zod";
import { objectIdSchema, orderStatusSchema } from "./common.js";
import type { CouponValidationResult } from "./coupon.js";

export const checkoutSchema = z.object({
  addressId: objectIdSchema,
  couponCode: z.string().trim().optional(),
  notes: z.string().trim().max(500).optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: orderStatusSchema,
  note: z.string().trim().max(200).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
});

export const orderListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  status: orderStatusSchema.optional(),
});

export const checkoutQuoteQuerySchema = z.object({
  couponCode: z.string().trim().optional(),
});

export interface CheckoutQuote {
  subtotal: number;
  discount: number;
  shippingCost: number;
  grandTotal: number;
}

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type CheckoutQuoteQuery = z.infer<typeof checkoutQuoteQuerySchema>;

export interface OrderItemDto {
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderAddressDto {
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface OrderStatusEntryDto {
  status: z.infer<typeof orderStatusSchema>;
  at: string;
  note?: string;
}

export interface OrderDto {
  orderId: string;
  orderNumber: string;
  status: z.infer<typeof orderStatusSchema>;
  items: OrderItemDto[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  grandTotal: number;
  coupon?: CouponValidationResult;
  notes?: string;
  address: OrderAddressDto;
  trackingNumber?: string;
  statusHistory: OrderStatusEntryDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResult {
  order: OrderDto;
}
