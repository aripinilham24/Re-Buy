import type { NextFunction, Response } from "express";
import type { NotificationListQuery } from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as notificationService from "./notification.service.js";

export const list = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getValidated<NotificationListQuery>(req, "query");
    const result = await notificationService.listNotifications(
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

export const unreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await notificationService.getUnreadCount(
      req.user!.userId,
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const markRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { notificationId } = getValidated<{ notificationId: string }>(
      req,
      "params",
    );
    const notification = await notificationService.markRead(
      req.user!.userId,
      notificationId,
    );
    return sendSuccess(res, notification, "Notification marked as read");
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await notificationService.markAllRead(req.user!.userId);
    return sendSuccess(res, result, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
};

export default { list, unreadCount, markRead, markAllRead };
