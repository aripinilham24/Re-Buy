import type {
  ApiSuccess,
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  LoginResult,
  RegisterInput,
  ResetPasswordInput,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export const loginService = async (data: LoginInput) => {
  const response = await api.post<ApiSuccess<LoginResult>>("/auth/login", data);
  return response.data.data;
};

export const registerService = async (data: RegisterInput) => {
  const response = await api.post<ApiSuccess<{ userId: string; email: string }>>(
    "/auth/register",
    data,
  );
  return response.data.data;
};

export const verifyEmailService = async (token: string) => {
  const response = await api.post<ApiSuccess<{ verified: boolean }>>(
    "/auth/verify-email",
    { token },
  );
  return response.data.data;
};

export const resendVerificationService = async (email: string) => {
  const response = await api.post<ApiSuccess<{ sent: boolean }>>(
    "/auth/resend-verification",
    { email },
  );
  return response.data.data;
};

export const forgotPasswordService = async (data: ForgotPasswordInput) => {
  const response = await api.post<ApiSuccess<{ sent: boolean }>>(
    "/auth/forgot-password",
    data,
  );
  return response.data.data;
};

export const resetPasswordService = async (data: ResetPasswordInput) => {
  const response = await api.post<ApiSuccess<{ reset: boolean }>>(
    "/auth/reset-password",
    data,
  );
  return response.data.data;
};

export const logoutService = async () => {
  await api.post("/auth/logout");
};

export const fetchMeService = async () => {
  const response = await api.get<ApiSuccess<AuthUser>>("/auth/me");
  return response.data.data;
};
