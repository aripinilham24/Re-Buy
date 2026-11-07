import type { NextFunction, Request, Response } from "express";
import type {
  CategoryInput,
  UpdateCategoryInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import * as categoryService from "./category.service.js";

export const list = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.listCategories(false);
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

export const listAll = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await categoryService.listCategories(true);
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<CategoryInput>(req, "body");
    const category = await categoryService.createCategory(input);
    return sendSuccess(res, category, "Category created", 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = getValidated<{ categoryId: string }>(req, "params");
    const input = getValidated<UpdateCategoryInput>(req, "body");
    const category = await categoryService.updateCategory(categoryId, input);
    return sendSuccess(res, category, "Category updated");
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = getValidated<{ categoryId: string }>(req, "params");
    const result = await categoryService.deleteCategory(categoryId);
    return sendSuccess(res, result, "Category deleted");
  } catch (error) {
    next(error);
  }
};

export default { list, listAll, create, update, remove };
