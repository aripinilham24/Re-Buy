import type {
  ChatConversationDto,
  ChatMessageDto,
  ChatMessageQuery,
  ChatMessagesResult,
  UserConversationDto,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import { notify } from "../notification/notification.service.js";
import { emitToAdmins, emitToUser } from "../../socket.js";
import * as chatRepository from "./chat.repository.js";
import {
  toConversationDto,
  toMessageDto,
  toUserConversationDto,
} from "./chat.repository.js";

const getOrCreateConversation = async (userId: string) => {
  const existing = await chatRepository.findConversationByUser(userId);
  if (existing) return existing;

  return chatRepository.createConversation(userId);
};

export const getUserConversation = async (
  userId: string,
): Promise<UserConversationDto> => {
  const conversation = await getOrCreateConversation(userId);
  const unreadCount = await chatRepository.countUnread(
    conversation._id.toString(),
    "user",
  );

  return toUserConversationDto(conversation, unreadCount);
};

const getMessages = async (
  conversationId: string,
  query: ChatMessageQuery,
  readerRole: "user" | "admin",
): Promise<ChatMessagesResult> => {
  await chatRepository.markMessagesRead(conversationId, readerRole);

  const result = await chatRepository.listMessages(
    conversationId,
    query.limit,
    query.cursor,
  );

  return {
    conversationId,
    items: result.items.map(toMessageDto),
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
};

export const getUserMessages = async (
  userId: string,
  query: ChatMessageQuery,
): Promise<ChatMessagesResult> => {
  const conversation = await getOrCreateConversation(userId);
  return getMessages(conversation._id.toString(), query, "user");
};

export const sendUserMessage = async (
  userId: string,
  body: string,
): Promise<ChatMessageDto> => {
  const conversation = await getOrCreateConversation(userId);
  const message = await chatRepository.createMessage({
    conversationId: conversation._id.toString(),
    senderId: userId,
    senderRole: "user",
    body,
  });

  await chatRepository.updateConversationLastMessage(
    conversation._id.toString(),
    body,
  );

  const dto = toMessageDto(message);
  emitToUser(userId, "chat:message", dto);
  emitToAdmins("chat:message", dto);

  return dto;
};

export const listAdminConversations = async (): Promise<
  ChatConversationDto[]
> => {
  const conversations = await chatRepository.listConversations();

  return Promise.all(
    conversations.map(async (conversation) =>
      toConversationDto(
        conversation,
        await chatRepository.countUnread(
          conversation._id.toString(),
          "admin",
        ),
      ),
    ),
  );
};

export const getAdminMessages = async (
  conversationId: string,
  query: ChatMessageQuery,
): Promise<ChatMessagesResult> => {
  const conversation = await chatRepository.findConversationById(
    conversationId,
  );
  if (!conversation) throw AppError.notFound("Conversation not found");

  return getMessages(conversationId, query, "admin");
};

export const sendAdminMessage = async (
  adminId: string,
  conversationId: string,
  body: string,
): Promise<ChatMessageDto> => {
  const conversation = await chatRepository.findConversationById(
    conversationId,
  );
  if (!conversation) throw AppError.notFound("Conversation not found");

  const message = await chatRepository.createMessage({
    conversationId,
    senderId: adminId,
    senderRole: "admin",
    body,
  });

  await chatRepository.updateConversationLastMessage(conversationId, body);

  const dto = toMessageDto(message);
  const userId = conversation.userId.toString();
  emitToUser(userId, "chat:message", dto);
  emitToAdmins("chat:message", dto);

  try {
    await notify({
      userId,
      type: "chat",
      title: "Pesan baru dari admin",
      message: body.slice(0, 120),
      link: "/chat",
    });
  } catch {
    // Notification failures should not block chat delivery.
  }

  return dto;
};
