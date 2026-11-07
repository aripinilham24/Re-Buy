import type { NextFunction, Request, Response } from "express";
import type {
  AdminUserListQuery,
  UpdateAdminUserInput,
  UpdateSettingsInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as adminService from "./admin.service.js";
import * as settingService from "../setting/setting.service.js";

export const stats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return sendSuccess(res, await adminService.getStats());
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = getValidated<AdminUserListQuery>(req, "query");
    const result = await adminService.listUsers(query);
    return sendSuccess(res, result.items, "OK", 200, {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = getValidated<{ userId: string }>(req, "params");
    const input = getValidated<UpdateAdminUserInput>(req, "body");
    const user = await adminService.updateUser(
      req.user!.userId,
      userId,
      input,
    );
    return sendSuccess(res, user, "User updated");
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    return sendSuccess(res, await settingService.getSettings());
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<UpdateSettingsInput>(req, "body");
    return sendSuccess(
      res,
      await settingService.updateSettings(input),
      "Settings updated",
    );
  } catch (error) {
    next(error);
  }
};

export default {
  stats,
  listUsers,
  updateUser,
  getSettings,
  updateSettings,
};
