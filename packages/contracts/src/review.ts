import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const reviewInputSchema = z.object({
  orderId: objectIdSchema,
  productId: objectIdSchema,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
  images: z.array(z.string().trim().min(1)).max(4).optional(),
});

export const reviewReplySchema = z.object({
  reply: z.string().trim().min(1).max(1000),
});

export const reviewProductQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  cursor: z.string().optional(),
});

export const reviewAdminQuerySchema = reviewProductQuerySchema;

export type ReviewInput = z.infer<typeof reviewInputSchema>;
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;
export type ReviewProductQuery = z.infer<typeof reviewProductQuerySchema>;
export type ReviewAdminQuery = z.infer<typeof reviewAdminQuerySchema>;

export interface ReviewDto {
  reviewId: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  adminReply?: string;
  createdAt: string;
}

export interface ReviewEligibility {
  canReview: boolean;
  orderId?: string;
  reason?: string;
}
