import type { NextFunction, Request, Response } from "express";
import type {
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  VerifyEmailInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import {
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
} from "../../common/cookies.js";
import { AppError } from "../../common/errors.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
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
    const input = getValidated<LoginInput>(req, "body");
    const { user, tokens } = await services.login(input);
    setAuthCookies(res, tokens);
    return sendSuccess(res, { user }, "Logged in");
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!refreshToken) {
      throw AppError.unauthorized("Refresh token is missing");
    }

    const { user, tokens } = await services.refresh(refreshToken);
    setAuthCookies(res, tokens);
    return sendSuccess(res, { user }, "Session refreshed");
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await services.logout(refreshToken);
    clearAuthCookies(res);
    return sendSuccess(res, { loggedOut: true }, "Logged out");
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
    const user = await services.me(req.user!.userId);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  verifyEmail,
  resendVerification,
  login,
  refresh,
  logout,
  me,
};
