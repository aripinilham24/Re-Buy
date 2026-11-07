import { Router } from "express";
import { z } from "zod";
import { objectIdSchema } from "@rebuy/contracts";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import WishlistController from "./wishlist.controller.js";

const productParamsSchema = z.object({ productId: objectIdSchema });

const router = Router();

router.use(verifyAuth);
router.get("/", WishlistController.list);
router.post(
  "/:productId",
  validate({ params: productParamsSchema }),
  WishlistController.add,
);
router.delete(
  "/:productId",
  validate({ params: productParamsSchema }),
  WishlistController.remove,
);

export default router;
