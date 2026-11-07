import { Router } from "express";
import { z } from "zod";
import {
  notificationListQuerySchema,
  objectIdSchema,
} from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import NotificationController from "./notification.controller.js";

const notificationParamsSchema = z.object({ notificationId: objectIdSchema });

const router = Router();

router.use(verifyAuth);
router.get(
  "/",
  validate({ query: notificationListQuerySchema }),
  NotificationController.list,
);
router.get("/unread-count", NotificationController.unreadCount);
router.patch("/read-all", NotificationController.markAllRead);
router.patch(
  "/:notificationId/read",
  validate({ params: notificationParamsSchema }),
  NotificationController.markRead,
);

export default router;
