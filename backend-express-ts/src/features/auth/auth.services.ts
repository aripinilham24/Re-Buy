import bcrypt from "bcrypt";
import type {
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  VerifyEmailInput,
} from "@rebuy/contracts";
import { AppError } from "../../common/errors.js";
import { env } from "../../config/env.js";
import { sendVerificationEmail } from "../../common/email.js";
import {
  createOpaqueToken,
  hashToken,
  hoursFromNow,
  issueTokens,
} from "./auth.tokens.js";
import * as authRepository from "./auth.repository.js";
import { toAuthUser } from "./auth.mapper.js";

export const register = async (input: RegisterInput) => {
  const existing = await authRepository.findUserByEmail(input.email);
  if (existing) {
    throw AppError.conflict("Email already registered");
  }

  const user = await authRepository.createUser({
    username: input.username,
    email: input.email,
    password: await bcrypt.hash(input.password, env.BCRYPT_SALT),
  });

  const { raw, hash } = createOpaqueToken();
  await authRepository.createAuthToken({
    userId: user._id,
    type: "verify_email",
    tokenHash: hash,
    expiresAt: hoursFromNow(24),
  });
  await sendVerificationEmail(user.email, raw);

  return { userId: user._id.toString(), email: user.email };
};

export const verifyEmail = async (input: VerifyEmailInput) => {
  const token = await authRepository.consumeAuthToken(
    hashToken(input.token),
    "verify_email",
  );
  if (!token) {
    throw AppError.badRequest("Invalid or expired verification token");
  }

  await authRepository.updateUser(token.userId.toString(), {
    emailVerifiedAt: new Date(),
  });

  return { verified: true };
};

export const resendVerification = async (input: ResendVerificationInput) => {
  const user = await authRepository.findUserByEmail(input.email);

  if (user && !user.emailVerifiedAt) {
    await authRepository.revokeAuthTokens(user._id, "verify_email");
    const { raw, hash } = createOpaqueToken();
    await authRepository.createAuthToken({
      userId: user._id,
      type: "verify_email",
      tokenHash: hash,
      expiresAt: hoursFromNow(24),
    });
    await sendVerificationEmail(user.email, raw);
  }

  return { sent: true };
};

export const login = async (input: LoginInput) => {
  const user = await authRepository.findUserByEmail(input.email, true);
  if (!user) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password!);
  if (!isPasswordValid) {
    throw AppError.unauthorized("Invalid email or password");
  }

  if (user.isBlocked) {
    throw AppError.forbidden("Account is blocked");
  }

  await authRepository.updateUser(user._id.toString(), {
    lastLoginAt: new Date(),
  });
  const tokens = await issueTokens(user);

  return { user: toAuthUser(user), tokens };
};

export const refresh = async (refreshToken: string) => {
  const token = await authRepository.consumeAuthToken(
    hashToken(refreshToken),
    "refresh",
  );
  if (!token) {
    throw AppError.unauthorized("Invalid refresh token");
  }

  const user = await authRepository.findUserById(token.userId.toString());
  if (!user || user.isBlocked) {
    await authRepository.revokeAuthTokens(token.userId, "refresh");
    throw AppError.unauthorized("Session expired");
  }

  const tokens = await issueTokens(user);
  return { user: toAuthUser(user), tokens };
};

export const logout = async (refreshToken?: string) => {
  if (refreshToken) {
    const token = await authRepository.findAuthTokenByHash(
      hashToken(refreshToken),
      "refresh",
    );
    if (token) {
      await authRepository.markAuthTokenUsed(token._id);
    }
  }

  return { loggedOut: true };
};

export const me = async (userId: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) throw AppError.notFound("User not found");

  return toAuthUser(user);
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
