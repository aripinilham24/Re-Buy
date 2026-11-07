import type { NextFunction, Response } from "express";
import type {
  CheckoutInput,
  OrderListQuery,
  OrderStatusUpdateInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as orderService from "./order.service.js";

export const checkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<CheckoutInput>(req, "body");
    const result = await orderService.checkout(req.user!.userId, input);
    return sendSuccess(res, result, "Order created", 201);
  } catch (error) {
    next(error);
  }
};

export const listMine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getValidated<OrderListQuery>(req, "query");
    const result = await orderService.listMine(req.user!.userId, query);
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const getMine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = getValidated<{ orderId: string }>(req, "params");
    const order = await orderService.getMine(req.user!.userId, orderId);
    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

export const cancelMine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = getValidated<{ orderId: string }>(req, "params");
    const order = await orderService.cancelMine(req.user!.userId, orderId);
    return sendSuccess(res, order, "Order cancelled");
  } catch (error) {
    next(error);
  }
};

export const listAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getValidated<OrderListQuery>(req, "query");
    const result = await orderService.listAdmin(query);
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = getValidated<{ orderId: string }>(req, "params");
    const order = await orderService.getAdmin(orderId);
    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = getValidated<{ orderId: string }>(req, "params");
    const input = getValidated<OrderStatusUpdateInput>(req, "body");
    const order = await orderService.updateStatusAdmin(orderId, input);
    return sendSuccess(res, order, "Order status updated");
  } catch (error) {
    next(error);
  }
};

export default {
  checkout,
  listMine,
  getMine,
  cancelMine,
  listAdmin,
  getAdmin,
  updateStatus,
};
