import type {
  NotificationDto,
  NotificationListQuery,
  NotificationType,
  UnreadNotificationCount,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import { emitToUser } from "../../socket.js";
import * as notificationRepository from "./notification.repository.js";
import { toNotificationDto } from "./notification.repository.js";

export const notify = async (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}): Promise<NotificationDto> => {
  const notification = await notificationRepository.createNotification(data);
  const dto = toNotificationDto(notification);
  emitToUser(data.userId, "notification:new", dto);
  return dto;
};

export const listNotifications = async (
  userId: string,
  query: NotificationListQuery,
) => {
  const result = await notificationRepository.listNotifications(
    userId,
    query.limit,
    query.cursor,
  );

  return {
    items: result.items.map(toNotificationDto),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
};

export const getUnreadCount = async (
  userId: string,
): Promise<UnreadNotificationCount> => {
  const count = await notificationRepository.countUnread(userId);
  return { count };
};

export const markRead = async (
  userId: string,
  notificationId: string,
): Promise<NotificationDto> => {
  const notification = await notificationRepository.markNotificationRead(
    userId,
    notificationId,
  );
  if (!notification) throw AppError.notFound("Notification not found");

  return toNotificationDto(notification);
};

export const markAllRead = async (userId: string) => {
  await notificationRepository.markAllNotificationsRead(userId);
  return { updated: true };
};
