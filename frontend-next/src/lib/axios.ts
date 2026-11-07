import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
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
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1",
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<unknown> | null = null;

const toApiError = (error: AxiosError<ApiFailure>) => {
  const body = error.response?.data;

  return new ApiError(body?.message ?? error.message ?? "Request failed", {
    status: error.response?.status,
    code: body?.code,
    details: body?.details,
  });
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiFailure>) => {
    const config = error.config as RetryableConfig | undefined;
    const url = config?.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !isAuthEndpoint
    ) {
      config._retry = true;
      try {
        refreshPromise ??= api.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return api(config);
      } catch {
        // Fall through to a normalized 401 error.
      }
    }

    return Promise.reject(toApiError(error));
  },
);

export default api;
