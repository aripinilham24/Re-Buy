interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T | null;
}

interface ErrorResponse {
  success: false;
  message: string;
  error: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
