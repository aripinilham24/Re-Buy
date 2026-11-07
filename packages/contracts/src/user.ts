import { z } from "zod";
import { roleSchema } from "./common.js";
import { emailSchema } from "./auth.js";

export const addressInputSchema = z.object({
  label: z.string().trim().min(1).max(50).default("Rumah"),
  recipientName: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,20}$/, "Invalid phone number"),
  street: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(100),
  province: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Invalid postal code"),
  notes: z.string().trim().max(200).optional(),
  isDefault: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  username: z.string().trim().min(2).max(50),
});

export type AddressInput = z.infer<typeof addressInputSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export interface AddressDto {
  addressId: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  isDefault: boolean;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  role: z.infer<typeof roleSchema>;
  profile: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface ProfileUpdateResult {
  user: UserProfile;
}

export interface EmailAvailability {
  email: string;
  available: boolean;
}
