import { z } from "zod";
import { objectIdSchema } from "./common.js";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug")
    .max(100)
    .optional(),
  description: z.string().trim().max(500).optional(),
  parentId: objectIdSchema.nullable().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = categoryInputSchema.partial();

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export interface CategoryDto {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  isActive: boolean;
  createdAt: string;
}
