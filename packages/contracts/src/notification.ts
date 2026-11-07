import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "order",
  "payment",
  "chat",
  "system",
]);

export const notificationListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type NotificationListQuery = z.infer<
  typeof notificationListQuerySchema
>;

export interface NotificationDto {
  notificationId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadNotificationCount {
  count: number;
}
