import type { NextFunction, Request, Response } from "express";
import type { MidtransNotification } from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as paymentService from "./payment.service.js";

export const create = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = getValidated<{ orderId: string }>(req, "params");
    const payment = await paymentService.createPayment(
      req.user!.userId,
      orderId,
    );
    return sendSuccess(res, payment, "Payment created", 201);
  } catch (error) {
    next(error);
  }
};

export const status = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = getValidated<{ orderId: string }>(req, "params");
    const result = await paymentService.getPaymentStatus(
      req.user!.userId,
      orderId,
    );
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export const sync = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = getValidated<{ orderId: string }>(req, "params");
    const payment = await paymentService.syncPayment(
      req.user!.userId,
      orderId,
    );
    return sendSuccess(res, payment, "Payment synced");
  } catch (error) {
    next(error);
  }
};

export const notification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = getValidated<MidtransNotification>(req, "body");
    const result = await paymentService.handleMidtransNotification(payload);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

export default { create, status, sync, notification };
