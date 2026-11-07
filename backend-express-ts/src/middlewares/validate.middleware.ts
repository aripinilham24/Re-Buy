import type { Request, RequestHandler } from "express";
import { ZodError, type ZodType } from "zod";
import { AppError } from "../common/errors.js";

export interface ValidatedRequestData {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      validated?: ValidatedRequestData;
    }
  }
}

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req, _res, next) => {
    try {
      req.validated = {
        body: schemas.body?.parse(req.body),
        query: schemas.query?.parse(req.query),
        params: schemas.params?.parse(req.params),
      };
      next();
    } catch (error) {
      const isZodError =
        error instanceof ZodError ||
        (typeof error === "object" &&
          error !== null &&
          (error as { name?: string }).name === "ZodError");

      if (isZodError) {
        return next(
          new AppError(
            "Validation failed",
            400,
            "VALIDATION_ERROR",
            (error as ZodError).flatten(),
          ),
        );
      }
      next(error);
    }
  };
};

export const getValidated = <T>(
  req: Request,
  part: keyof ValidatedRequestData,
): T => req.validated?.[part] as T;
