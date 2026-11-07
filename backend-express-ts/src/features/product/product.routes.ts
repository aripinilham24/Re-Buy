import { Router } from "express";
import { z } from "zod";
import {
  adminProductListQuerySchema,
  objectIdSchema,
  productInputSchema,
  productListQuerySchema,
  updateProductSchema,
} from "@rebuy/contracts";
import ProductController from "./product.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";

const productIdParamsSchema = z.object({ productId: objectIdSchema });
const productSlugParamsSchema = z.object({ slug: z.string().min(1).max(140) });

export const publicProductRouter = Router();
publicProductRouter.get(
  "/",
  validate({ query: productListQuerySchema }),
  ProductController.list,
);
publicProductRouter.get(
  "/:slug",
  validate({ params: productSlugParamsSchema }),
  ProductController.getBySlug,
);

export const adminProductRouter = Router();
adminProductRouter.get(
  "/",
  validate({ query: adminProductListQuerySchema }),
  ProductController.listAdmin,
);
adminProductRouter.get(
  "/:productId",
  validate({ params: productIdParamsSchema }),
  ProductController.getById,
);
adminProductRouter.post(
  "/",
  validate({ body: productInputSchema }),
  ProductController.create,
);
adminProductRouter.patch(
  "/:productId",
  validate({ params: productIdParamsSchema, body: updateProductSchema }),
  ProductController.update,
);
adminProductRouter.delete(
  "/:productId",
  validate({ params: productIdParamsSchema }),
  ProductController.remove,
);
