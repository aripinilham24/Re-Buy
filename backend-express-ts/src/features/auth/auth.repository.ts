import type { Types } from "mongoose";
import UserModel, { type UserDocument } from "../user/user.model.js";
import AuthTokenModel from "./auth-token.model.js";

export const findUserByEmail = (email: string, withPassword = false) => {
  const query = UserModel.findOne({ email });
  return withPassword ? query.select("+password") : query;
};

export const findUserById = (userId: string) => UserModel.findById(userId);

export const createUser = (data: {
  username: string;
  email: string;
  password: string;
}) => UserModel.create(data);

export const updateUser = (userId: string, data: Record<string, unknown>) =>
  UserModel.findByIdAndUpdate(userId, data, { new: true });

export const createAuthToken = (data: {
  userId: UserDocument["_id"];
  type: "refresh" | "verify_email" | "reset_password";
  tokenHash: string;
  expiresAt: Date;
}) => AuthTokenModel.create(data);

export const findActiveAuthToken = (
  tokenHash: string,
  type: "refresh" | "verify_email" | "reset_password",
) =>
  AuthTokenModel.findOne({
    tokenHash,
    type,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

export const findAuthTokenByHash = (
  tokenHash: string,
  type: "refresh" | "verify_email" | "reset_password",
) => AuthTokenModel.findOne({ tokenHash, type });

export const markAuthTokenUsed = (tokenId: Types.ObjectId) =>
  AuthTokenModel.findByIdAndUpdate(tokenId, { usedAt: new Date() });

export const revokeAuthTokens = (
  userId: Types.ObjectId,
  type?: "refresh" | "verify_email" | "reset_password",
) =>
  AuthTokenModel.updateMany(
    { userId, ...(type ? { type } : {}), usedAt: null },
    { usedAt: new Date() },
  );
