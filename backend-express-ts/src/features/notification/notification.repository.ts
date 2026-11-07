import type { NotificationDto, NotificationType } from "@rebuy/contracts";
import type { NotificationDocument } from "./notification.model.js";
import NotificationModel from "./notification.model.js";
import { decodeCursor, encodeCursor } from "../../common/pagination.js";

export const toNotificationDto = (
  notification: NotificationDocument,
): NotificationDto => ({
  notificationId: notification._id.toString(),
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link ?? undefined,
  isRead: notification.isRead,
  createdAt: new Date(notification.createdAt).toISOString(),
});

export const createNotification = (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) => NotificationModel.create(data);

export const listNotifications = async (
  userId: string,
  limit: number,
  cursor?: string,
) => {
  const createdAtCursor = decodeCursor<{ createdAt: string; id: string }>(
    cursor,
  );
  const filter: Record<string, unknown> = { userId };
  if (createdAtCursor) {
    const createdAt = new Date(createdAtCursor.createdAt);
    filter.$and = [
      {
        $or: [
          { createdAt: { $lt: createdAt } },
          { createdAt, _id: { $lt: createdAtCursor.id } },
        ],
      },
    ];
  }

  const notifications = await NotificationModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = notifications.length > limit;
  const page = hasMore ? notifications.slice(0, limit) : notifications;
  const last = page[page.length - 1];

  return {
    items: page,
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeCursor({
            createdAt: new Date(last.createdAt).toISOString(),
            id: last._id.toString(),
          })
        : null,
  };
};

export const countUnread = (userId: string) =>
  NotificationModel.countDocuments({ userId, isRead: false });

export const markNotificationRead = (userId: string, notificationId: string) =>
  NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { returnDocument: "after" },
  );

export const markAllNotificationsRead = (userId: string) =>
  NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
