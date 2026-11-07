import type { NextFunction, Response } from "express";
import type { CartItemInput, CartItemUpdate } from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as cartService from "./cart.service.js";

export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    return sendSuccess(res, cart);
  } catch (error) {
    next(error);
  }
};

export const addItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<CartItemInput>(req, "body");
    const cart = await cartService.addItem(
      req.user!.userId,
      input.productId,
      input.quantity,
    );
    return sendSuccess(res, cart, "Item added to cart", 201);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const { quantity } = getValidated<CartItemUpdate>(req, "body");
    const cart = await cartService.updateItemQuantity(
      req.user!.userId,
      productId,
      quantity,
    );
    return sendSuccess(res, cart, "Cart updated");
  } catch (error) {
    next(error);
  }
};

export const removeItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = getValidated<{ productId: string }>(req, "params");
    const cart = await cartService.removeItem(req.user!.userId, productId);
    return sendSuccess(res, cart, "Item removed");
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const cart = await cartService.clearCart(req.user!.userId);
    return sendSuccess(res, cart, "Cart cleared");
  } catch (error) {
    next(error);
  }
};

export default { getCart, addItem, updateItem, removeItem, clearCart };
