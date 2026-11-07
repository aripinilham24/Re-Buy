import type {
  ApiSuccess,
  ChatConversationDto,
  ChatMessageDto,
  ChatMessagesResult,
  UserConversationDto,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export const getUserConversationService = async () => {
  const response = await api.get<ApiSuccess<UserConversationDto>>(
    "/chat/conversation",
  );
  return response.data.data;
};

export const getUserChatMessagesService = async (
  conversationId: string,
): Promise<ChatMessagesResult> => {
  const response = await api.get<ApiSuccess<ChatMessageDto[]>>(
    "/chat/messages",
    { params: { limit: 100 } },
  );
  return {
    conversationId,
    items: response.data.data,
    nextCursor: response.data.meta?.nextCursor ?? null,
    hasMore: response.data.meta?.hasMore ?? false,
  };
};

export const sendUserChatMessageService = async (body: string) => {
  const response = await api.post<ApiSuccess<ChatMessageDto>>(
    "/chat/messages",
    { body },
  );
  return response.data.data;
};

export const listAdminConversationsService = async () => {
  const response = await api.get<ApiSuccess<ChatConversationDto[]>>(
    "/admin/chat/conversations",
  );
  return response.data.data;
};

export const getAdminChatMessagesService = async (
  conversationId: string,
): Promise<ChatMessagesResult> => {
  const response = await api.get<ApiSuccess<ChatMessageDto[]>>(
    `/admin/chat/conversations/${conversationId}/messages`,
    { params: { limit: 100 } },
  );
  return {
    conversationId,
    items: response.data.data,
    nextCursor: response.data.meta?.nextCursor ?? null,
    hasMore: response.data.meta?.hasMore ?? false,
  };
};

export const sendAdminChatMessageService = async (
  conversationId: string,
  body: string,
) => {
  const response = await api.post<ApiSuccess<ChatMessageDto>>(
    `/admin/chat/conversations/${conversationId}/messages`,
    { body },
  );
  return response.data.data;
};
