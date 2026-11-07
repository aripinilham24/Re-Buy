import type {
  ApiSuccess,
  PaymentDto,
  PaymentStatusResult,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export const createPaymentService = async (orderId: string) => {
  const response = await api.post<ApiSuccess<PaymentDto>>(
    `/payments/${orderId}`,
  );
  return response.data.data;
};

export const getPaymentStatusService = async (orderId: string) => {
  const response = await api.get<ApiSuccess<PaymentStatusResult>>(
    `/payments/${orderId}`,
  );
  return response.data.data;
};

export const syncPaymentService = async (orderId: string) => {
  const response = await api.post<ApiSuccess<PaymentDto>>(
    `/payments/${orderId}/sync`,
  );
  return response.data.data;
};
