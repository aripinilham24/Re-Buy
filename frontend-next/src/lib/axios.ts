import axios, { AxiosError } from "axios";
import type { ApiFailure } from "@rebuy/contracts";

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    options?: { status?: number; code?: string; details?: unknown },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiFailure>) => {
    const body = error.response?.data;

    return Promise.reject(
      new ApiError(body?.message ?? error.message ?? "Request failed", {
        status: error.response?.status,
        code: body?.code,
        details: body?.details,
      }),
    );
  },
);

export default api;
