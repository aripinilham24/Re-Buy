import type {
  ApiSuccess,
  NotificationDto,
  UnreadNotificationCount,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export const listNotificationsService = async () => {
  const response = await api.get<ApiSuccess<NotificationDto[]>>(
    "/notifications",
    { params: { limit: 50 } },
  );
  return response.data.data;
};

export const getUnreadNotificationCountService = async () => {
  const response = await api.get<ApiSuccess<UnreadNotificationCount>>(
    "/notifications/unread-count",
  );
  return response.data.data;
};

export const markNotificationReadService = async (notificationId: string) => {
  const response = await api.patch<ApiSuccess<NotificationDto>>(
    `/notifications/${notificationId}/read`,
  );
  return response.data.data;
};

export const markAllNotificationsReadService = async () => {
  await api.patch("/notifications/read-all");
};
