import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import {
  getAdminChatMessagesService,
  getUserChatMessagesService,
  getUserConversationService,
  listAdminConversationsService,
  sendAdminChatMessageService,
  sendUserChatMessageService,
} from "../services/chatServices";

export const useUserConversation = () =>
  useQuery({
    queryKey: ["chat-conversation"],
    queryFn: getUserConversationService,
  });

export const useUserChatMessages = (conversationId?: string) =>
  useQuery({
    queryKey: ["chat-messages", conversationId],
    queryFn: () => getUserChatMessagesService(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 10_000,
  });

export const useSendUserChatMessage = (conversationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendUserChatMessageService,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat-conversation"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal mengirim pesan")),
  });
};

export const useAdminConversations = () =>
  useQuery({
    queryKey: ["admin-chat-conversations"],
    queryFn: listAdminConversationsService,
    refetchInterval: 15_000,
  });

export const useAdminChatMessages = (conversationId?: string) =>
  useQuery({
    queryKey: ["admin-chat-messages", conversationId],
    queryFn: () => getAdminChatMessagesService(conversationId!),
    enabled: Boolean(conversationId),
    refetchInterval: 10_000,
  });

export const useSendAdminChatMessage = (conversationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) =>
      sendAdminChatMessageService(conversationId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-chat-messages", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-chat-conversations"],
      });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal mengirim pesan")),
  });
};
