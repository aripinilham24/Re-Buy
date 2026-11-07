import bcrypt from "bcrypt";
import type {
  RegisterInput,
  ResendVerificationInput,
  VerifyEmailInput,
} from "@rebuy/contracts";
import type { FormLogin } from "../../types/formAuth.types.js";
import { AppError } from "../../common/errors.js";
import { env } from "../../config/env.js";
import { sendVerificationEmail } from "../../common/email.js";
import { validateLogin } from "./auth.validations.js";
import { createOpaqueToken, hashToken, hoursFromNow } from "./auth.tokens.js";
import * as authRepository from "./auth.repository.js";
import { toAuthUser } from "./auth.mapper.js";
import createJwt from "../../utils/jwt.utils.js";

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
  const token = await authRepository.findActiveAuthToken(
    hashToken(input.token),
    "verify_email",
  );
  if (!token) {
    throw AppError.badRequest("Invalid or expired verification token");
  }

  await authRepository.markAuthTokenUsed(token._id);
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

const login = async (data: FormLogin) => {
  validateLogin(data);
  const { email, password } = data;

  const user = await authRepository.findUserByEmail(email, true);
  if (!user) throw new AppError("Invalid email or password", 409);

  const isPasswordValid = await bcrypt.compare(password, user.password!);
  if (!isPasswordValid) throw new AppError("Invalid email or password", 409);

  if (user.isBlocked) throw AppError.forbidden("Account is blocked");

  const tokens = createJwt(user);

  return {
    data: {
      success: true,
      message: "User logged in successfully",
      data: {
        userId: user._id,
        name: user.username,
        email: user.email,
        profile: user.avatar,
      },
    },
    tokens,
  };
};

const me = async (userId: string) => {
  const user = await authRepository.findUserById(userId);
  if (!user) throw AppError.notFound("User not found");

  return {
    success: true,
    data: toAuthUser(user),
  };
};

export default {
  register,
  verifyEmail,
  resendVerification,
  login,
  me,
};
