import type { Request, Response } from "express";
import services from "./auth.services.js";
import { AppError } from "../../utils/AppError.js";

const register = async (req: Request, res: Response) => {
  try {
    const result = await services.register(req.body);
    res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof AppError) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const result = await services.login(req.body);
    res.status(200).json(result);
  } catch (e: unknown) {
    if (e instanceof AppError) {
      return res.status(e.statusCode).json({
        success: false,
        message: e.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default {
  register,
  login,
};
