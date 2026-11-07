import { Router } from "express";
import { z } from "zod";
import {
  checkoutSchema,
  objectIdSchema,
  orderListQuerySchema,
  orderStatusUpdateSchema,
} from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import OrderController from "./order.controller.js";

const orderParamsSchema = z.object({ orderId: objectIdSchema });

export const userOrderRouter = Router();
userOrderRouter.use(verifyAuth);
userOrderRouter.post(
  "/checkout",
  validate({ body: checkoutSchema }),
  OrderController.checkout,
);
userOrderRouter.get(
  "/",
  validate({ query: orderListQuerySchema }),
  OrderController.listMine,
);
userOrderRouter.get(
  "/:orderId",
  validate({ params: orderParamsSchema }),
  OrderController.getMine,
);
userOrderRouter.post(
  "/:orderId/cancel",
  validate({ params: orderParamsSchema }),
  OrderController.cancelMine,
);

export const adminOrderRouter = Router();
adminOrderRouter.get(
  "/",
  validate({ query: orderListQuerySchema }),
  OrderController.listAdmin,
);
adminOrderRouter.get(
  "/:orderId",
  validate({ params: orderParamsSchema }),
  OrderController.getAdmin,
);
adminOrderRouter.patch(
  "/:orderId/status",
  validate({ params: orderParamsSchema, body: orderStatusUpdateSchema }),
  OrderController.updateStatus,
);
