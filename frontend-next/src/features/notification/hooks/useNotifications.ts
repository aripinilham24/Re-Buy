import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  getUnreadNotificationCountService,
  listNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "../services/notificationServices";

export const useNotifications = (enabled = true) =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: listNotificationsService,
    enabled,
  });

export const useUnreadNotificationCount = (enabled = true) =>
  useQuery({
    queryKey: ["unread-notifications"],
    queryFn: getUnreadNotificationCountService,
    enabled,
    refetchInterval: 30_000,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationReadService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menandai notifikasi")),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal menandai notifikasi")),
  });
};
