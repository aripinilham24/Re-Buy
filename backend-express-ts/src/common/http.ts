import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ApiSuccess, PaginationMeta } from "@rebuy/contracts";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  status = 200,
  meta?: PaginationMeta,
) {
  const payload: ApiSuccess<T> = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = (handler: AsyncRouteHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message = "OK",
) {
  return sendSuccess(res, data, message, 200, meta);
}
