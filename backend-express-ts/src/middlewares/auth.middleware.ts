import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const verifyAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      code: "UNAUTHORIZED",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET,
    ) as AuthRequest["user"] | undefined;

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    const expired = error instanceof jwt.TokenExpiredError;
    return res.status(401).json({
      success: false,
      message: expired ? "Access token expired" : "Invalid token",
      code: expired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
    });
  }
};
