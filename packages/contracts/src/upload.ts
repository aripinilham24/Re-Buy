import { z } from "zod";

export const uploadContentTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const presignUploadSchema = z.object({
  filename: z.string().trim().min(1).max(200),
  contentType: uploadContentTypeSchema,
  folder: z.enum(["products", "avatars"]).default("products"),
});

export type PresignUploadInput = z.infer<typeof presignUploadSchema>;

export interface PresignUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}
