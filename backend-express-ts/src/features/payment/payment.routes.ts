import { Router } from "express";
import { z } from "zod";
import { midtransNotificationSchema, objectIdSchema } from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import PaymentController from "./payment.controller.js";

const orderParamsSchema = z.object({ orderId: objectIdSchema });

const router = Router();

router.post(
  "/midtrans/notification",
  validate({ body: midtransNotificationSchema }),
  PaymentController.notification,
);
router.post(
  "/:orderId",
  verifyAuth,
  validate({ params: orderParamsSchema }),
  PaymentController.create,
);
router.get(
  "/:orderId",
  verifyAuth,
  validate({ params: orderParamsSchema }),
  PaymentController.status,
);
router.post(
  "/:orderId/sync",
  verifyAuth,
  validate({ params: orderParamsSchema }),
  PaymentController.sync,
);

export default router;
