import type {
  ChatConversationDto,
  ChatMessageDto,
  UserConversationDto,
} from "@rebuy/contracts";
import type { UserDocument } from "../user/user.model.js";
import ConversationModel, {
  type ConversationDocument,
} from "./conversation.model.js";
import MessageModel, { type MessageDocument } from "./message.model.js";
import { decodeCursor, encodeCursor } from "../../common/pagination.js";

export type PopulatedConversation = Omit<ConversationDocument, "userId"> & {
  userId: UserDocument;
};

export const toMessageDto = (message: MessageDocument): ChatMessageDto => ({
  messageId: message._id.toString(),
  conversationId: message.conversationId.toString(),
  senderId: message.senderId.toString(),
  senderRole: message.senderRole,
  body: message.body,
  createdAt: new Date(message.createdAt).toISOString(),
  readAt: message.readAt?.toISOString(),
});

export const toUserConversationDto = (
  conversation: ConversationDocument,
  unreadCount: number,
): UserConversationDto => ({
  conversationId: conversation._id.toString(),
  lastMessage: conversation.lastMessage ?? undefined,
  lastMessageAt: conversation.lastMessageAt?.toISOString(),
  unreadCount,
});

export const toConversationDto = (
  conversation: PopulatedConversation,
  unreadCount: number,
): ChatConversationDto => ({
  conversationId: conversation._id.toString(),
  userId: conversation.userId._id.toString(),
  userName: conversation.userId.username,
  userEmail: conversation.userId.email,
  lastMessage: conversation.lastMessage ?? undefined,
  lastMessageAt: conversation.lastMessageAt?.toISOString(),
  unreadCount,
});

export const findConversationByUser = (userId: string) =>
  ConversationModel.findOne({ userId });

export const findConversationById = (conversationId: string) =>
  ConversationModel.findById(conversationId);

export const createConversation = (userId: string) =>
  ConversationModel.create({ userId });

export const listConversations = async () => {
  const conversations = await ConversationModel.find()
    .sort({ lastMessageAt: -1, createdAt: -1 })
    .populate<{ userId: UserDocument }>("userId");

  return conversations as unknown as PopulatedConversation[];
};

export const updateConversationLastMessage = (
  conversationId: string,
  body: string,
) =>
  ConversationModel.findByIdAndUpdate(
    conversationId,
    { lastMessage: body.slice(0, 200), lastMessageAt: new Date() },
    { returnDocument: "after" },
  );

export const createMessage = (data: {
  conversationId: string;
  senderId: string;
  senderRole: "user" | "admin";
  body: string;
}) => MessageModel.create(data);

export const listMessages = async (
  conversationId: string,
  limit: number,
  cursor?: string,
) => {
  const createdAtCursor = decodeCursor<{ createdAt: string; id: string }>(
    cursor,
  );
  const filter: Record<string, unknown> = { conversationId };
  if (createdAtCursor) {
    const createdAt = new Date(createdAtCursor.createdAt);
    filter.$and = [
      {
        $or: [
          { createdAt: { $gt: createdAt } },
          { createdAt, _id: { $gt: createdAtCursor.id } },
        ],
      },
    ];
  }

  const messages = await MessageModel.find(filter)
    .sort({ createdAt: 1, _id: 1 })
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;
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

export const markMessagesRead = (
  conversationId: string,
  readerRole: "user" | "admin",
) =>
  MessageModel.updateMany(
    {
      conversationId,
      senderRole: readerRole === "user" ? "admin" : "user",
      readAt: null,
    },
    { readAt: new Date() },
  );

export const countUnread = (
  conversationId: string,
  readerRole: "user" | "admin",
) =>
  MessageModel.countDocuments({
    conversationId,
    senderRole: readerRole === "user" ? "admin" : "user",
    readAt: null,
  });
