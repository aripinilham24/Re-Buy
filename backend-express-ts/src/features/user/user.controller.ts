import type { NextFunction, Response } from "express";
import type {
  AddressInput,
  UpdateAddressInput,
  UpdateProfileInput,
} from "@rebuy/contracts";
import { sendSuccess } from "../../common/http.js";
import { getValidated } from "../../middlewares/validate.middleware.js";
import type { AuthRequest } from "../../middlewares/auth.middleware.js";
import * as userService from "./user.service.js";

const getUserId = (req: AuthRequest) => req.user!.userId;

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getProfile(getUserId(req));
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<UpdateProfileInput>(req, "body");
    const user = await userService.updateProfile(getUserId(req), input);
    return sendSuccess(res, user, "Profile updated");
  } catch (error) {
    next(error);
  }
};

export const listAddresses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const addresses = await userService.listAddresses(getUserId(req));
    return sendSuccess(res, addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = getValidated<AddressInput>(req, "body");
    const address = await userService.createAddress(getUserId(req), input);
    return sendSuccess(res, address, "Address created", 201);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { addressId } = getValidated<{ addressId: string }>(req, "params");
    const input = getValidated<UpdateAddressInput>(req, "body");
    const address = await userService.updateAddress(
      getUserId(req),
      addressId,
      input,
    );
    return sendSuccess(res, address, "Address updated");
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { addressId } = getValidated<{ addressId: string }>(req, "params");
    const result = await userService.deleteAddress(getUserId(req), addressId);
    return sendSuccess(res, result, "Address deleted");
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { addressId } = getValidated<{ addressId: string }>(req, "params");
    const address = await userService.setDefaultAddress(
      getUserId(req),
      addressId,
    );
    return sendSuccess(res, address, "Default address updated");
  } catch (error) {
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
