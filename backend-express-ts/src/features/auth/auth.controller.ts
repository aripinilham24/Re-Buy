import type { Request, Response, NextFunction } from "express";
import services from "./auth.services.js";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await services.register(req.body);
    res.status(200).json(result);
  } catch (e: unknown) {
    next(e);
  }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await services.login(req.body);
    res.status(200).json(result);
  } catch (e: unknown) {
    next(e);
  }
};

export default {
  register,
  login,
};
