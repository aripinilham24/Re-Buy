import type { NextFunction, Response } from "express";
import type {
  ChatMessageQuery,
  SendChatMessageInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as chatService from "./chat.service.js";

export const getConversation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const conversation = await chatService.getUserConversation(
      req.user!.userId,
    );
    return sendSuccess(res, conversation);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getValidated<ChatMessageQuery>(req, "query");
    const result = await chatService.getUserMessages(
      req.user!.userId,
      query,
    );
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = getValidated<SendChatMessageInput>(req, "body");
    const message = await chatService.sendUserMessage(
      req.user!.userId,
      body,
    );
    return sendSuccess(res, message, "Message sent", 201);
  } catch (error) {
    next(error);
  }
};

export const adminListConversations = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const conversations = await chatService.listAdminConversations();
    return sendSuccess(res, conversations);
  } catch (error) {
    next(error);
  }
};

export const adminGetMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { conversationId } = getValidated<{ conversationId: string }>(
      req,
      "params",
    );
    const query = getValidated<ChatMessageQuery>(req, "query");
    const result = await chatService.getAdminMessages(
      conversationId,
      query,
    );
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const adminSendMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { conversationId } = getValidated<{ conversationId: string }>(
      req,
      "params",
    );
    const { body } = getValidated<SendChatMessageInput>(req, "body");
    const message = await chatService.sendAdminMessage(
      req.user!.userId,
      conversationId,
      body,
    );
    return sendSuccess(res, message, "Message sent", 201);
  } catch (error) {
    next(error);
  }
};

export default {
  getConversation,
  getMessages,
  sendMessage,
  adminListConversations,
  adminGetMessages,
  adminSendMessage,
};
