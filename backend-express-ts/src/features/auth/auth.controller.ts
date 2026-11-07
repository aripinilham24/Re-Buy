import type { NextFunction, Request, Response } from "express";
import type {
  RegisterInput,
  ResendVerificationInput,
  VerifyEmailInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import { env } from "../../config/env.js";
import services from "./auth.services.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<RegisterInput>(req, "body");
    const result = await services.register(input);
    return sendSuccess(
      res,
      result,
      "Registration successful. Check your email to verify.",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<VerifyEmailInput>(req, "body");
    const result = await services.verifyEmail(input);
    return sendSuccess(res, result, "Email verified");
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<ResendVerificationInput>(req, "body");
    const result = await services.resendVerification(input);
    return sendSuccess(res, result, "Verification email sent");
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await services.login(req.body);
    res.cookie("token", result.tokens.accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await services.me(req.user!.userId);
    return sendSuccess(res, result.data);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  verifyEmail,
  resendVerification,
  login,
  me,
};
