import { z } from "zod";

export const sendChatMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const chatMessageQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type ChatMessageQuery = z.infer<typeof chatMessageQuerySchema>;

export interface ChatMessageDto {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderRole: "user" | "admin";
  body: string;
  createdAt: string;
  readAt?: string;
}

export interface ChatConversationDto {
  conversationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface UserConversationDto {
  conversationId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface ChatMessagesResult {
  conversationId: string;
  items: ChatMessageDto[];
  nextCursor: string | null;
  hasMore: boolean;
}
