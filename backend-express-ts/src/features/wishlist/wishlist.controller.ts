import type { NextFunction, Response } from "express";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as wishlistService from "./wishlist.service.js";

export const list = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const items = await wishlistService.listWishlist(req.user!.userId);
    return sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
};

export const add = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const item = await wishlistService.addWishlistItem(
      req.user!.userId,
      productId,
    );
    return sendSuccess(res, item, "Added to wishlist", 201);
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const result = await wishlistService.removeWishlistItem(
      req.user!.userId,
      productId,
    );
    return sendSuccess(res, result, "Removed from wishlist");
  } catch (error) {
    next(error);
  }
};

export default { list, add, remove };
