import { Router } from "express";
import { z } from "zod";
import {
  chatMessageQuerySchema,
  objectIdSchema,
  sendChatMessageSchema,
} from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import ChatController from "./chat.controller.js";

const conversationParamsSchema = z.object({ conversationId: objectIdSchema });

export const userChatRouter = Router();
userChatRouter.use(verifyAuth);
userChatRouter.get("/conversation", ChatController.getConversation);
userChatRouter.get(
  "/messages",
  validate({ query: chatMessageQuerySchema }),
  ChatController.getMessages,
);
userChatRouter.post(
  "/messages",
  validate({ body: sendChatMessageSchema }),
  ChatController.sendMessage,
);

export const adminChatRouter = Router();
adminChatRouter.get("/conversations", ChatController.adminListConversations);
adminChatRouter.get(
  "/conversations/:conversationId/messages",
  validate({ params: conversationParamsSchema, query: chatMessageQuerySchema }),
  ChatController.adminGetMessages,
);
adminChatRouter.post(
  "/conversations/:conversationId/messages",
  validate({ params: conversationParamsSchema, body: sendChatMessageSchema }),
  ChatController.adminSendMessage,
);
