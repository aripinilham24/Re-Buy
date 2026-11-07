import { Router } from "express";
import { categoryInputSchema, updateCategorySchema } from "@rebuy/contracts";
import { z } from "zod";
import { objectIdSchema } from "@rebuy/contracts";
import CategoryController from "./category.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";

const categoryParamsSchema = z.object({ categoryId: objectIdSchema });

export const publicCategoryRouter = Router();
publicCategoryRouter.get("/", CategoryController.list);

export const adminCategoryRouter = Router();
adminCategoryRouter.get("/", CategoryController.listAll);
adminCategoryRouter.post(
  "/",
  validate({ body: categoryInputSchema }),
  CategoryController.create,
);
adminCategoryRouter.patch(
  "/:categoryId",
  validate({ params: categoryParamsSchema, body: updateCategorySchema }),
  CategoryController.update,
);
adminCategoryRouter.delete(
  "/:categoryId",
  validate({ params: categoryParamsSchema }),
  CategoryController.remove,
);
