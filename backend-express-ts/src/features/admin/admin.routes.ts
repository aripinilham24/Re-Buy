import { Router } from "express";
import { z } from "zod";
import {
  adminUserListQuerySchema,
  objectIdSchema,
  updateAdminUserSchema,
  updateSettingsSchema,
} from "@rebuy/contracts";
import { validate } from "../../middlewares/validate.middleware.js";
import AdminController from "./admin.controller.js";

const userParamsSchema = z.object({ userId: objectIdSchema });

const router = Router();

router.get("/stats", AdminController.stats);
router.get(
  "/users",
  validate({ query: adminUserListQuerySchema }),
  AdminController.listUsers,
);
router.patch(
  "/users/:userId",
  validate({ params: userParamsSchema, body: updateAdminUserSchema }),
  AdminController.updateUser,
);
router.get("/settings", AdminController.getSettings);
router.patch(
  "/settings",
  validate({ body: updateSettingsSchema }),
  AdminController.updateSettings,
);

export default router;
