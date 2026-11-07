import { Router } from "express";
import { z } from "zod";
import {
  cartItemInputSchema,
  cartItemUpdateSchema,
  objectIdSchema,
} from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import CartController from "./cart.controller.js";

const productParamsSchema = z.object({ productId: objectIdSchema });

const router = Router();

router.use(verifyAuth);
router.get("/", CartController.getCart);
router.post(
  "/items",
  validate({ body: cartItemInputSchema }),
  CartController.addItem,
);
router.patch(
  "/items/:productId",
  validate({ params: productParamsSchema, body: cartItemUpdateSchema }),
  CartController.updateItem,
);
router.delete(
  "/items/:productId",
  validate({ params: productParamsSchema }),
  CartController.removeItem,
);
router.delete("/", CartController.clearCart);

export default router;
