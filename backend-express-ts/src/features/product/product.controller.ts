import type { NextFunction, Request, Response } from "express";
import type {
  AdminProductListQuery,
  ProductInput,
  ProductListQuery,
  UpdateProductInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import * as productService from "./product.service.js";

export const list = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getValidated<ProductListQuery>(req, "query");
    const result = await productService.listPublic(query);
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const listAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getValidated<AdminProductListQuery>(req, "query");
    const result = await productService.listAdmin(query);
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const getBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = getValidated<{ slug: string }>(req, "params");
    const product = await productService.getPublicBySlug(slug);
    return sendSuccess(res, product);
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const product = await productService.getAdminById(productId);
    return sendSuccess(res, product);
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
    const input = getValidated<ProductInput>(req, "body");
    const product = await productService.createProduct(input);
    return sendSuccess(res, product, "Product created", 201);
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
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const input = getValidated<UpdateProductInput>(req, "body");
    const product = await productService.updateProduct(productId, input);
    return sendSuccess(res, product, "Product updated");
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
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const result = await productService.deleteProduct(productId);
    return sendSuccess(res, result, "Product deleted");
  } catch (error) {
    next(error);
  }
};

export default {
  list,
  listAdmin,
  getBySlug,
  getById,
  create,
  update,
  remove,
};
