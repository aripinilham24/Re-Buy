import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@rebuy/contracts";
import AuthController from "./auth.controller.js";
import { verifyAuth } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { env } from "../../config/env.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: {
    success: false,
    message: "Too many authentication attempts, try again later",
    code: "RATE_LIMITED",
  },
});

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  AuthController.register,
);
router.post(
  "/verify-email",
  authLimiter,
  validate({ body: verifyEmailSchema }),
  AuthController.verifyEmail,
);
router.post(
  "/resend-verification",
  authLimiter,
  validate({ body: resendVerificationSchema }),
  AuthController.resendVerification,
);
router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  AuthController.login,
);
router.post("/refresh", authLimiter, AuthController.refresh);
router.post("/logout", AuthController.logout);
router.post(
  "/forgot-password",
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  AuthController.forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate({ body: resetPasswordSchema }),
  AuthController.resetPassword,
);
router.patch(
  "/password",
  verifyAuth,
  validate({ body: changePasswordSchema }),
  AuthController.changePassword,
);
router.get("/me", verifyAuth, AuthController.me);

export default router;
