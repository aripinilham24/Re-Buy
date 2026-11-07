import type {
  ApiSuccess,
  CheckoutInput,
  CheckoutQuote,
  OrderDto,
  OrderStatus,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export interface OrderListParams {
  limit?: number;
  cursor?: string;
  status?: OrderStatus;
}

export const getQuoteService = async (couponCode?: string) => {
  const response = await api.get<ApiSuccess<CheckoutQuote>>("/orders/quote", {
    params: { couponCode },
  });
  return response.data.data;
};

export const checkoutService = async (data: CheckoutInput) => {
  const response = await api.post<ApiSuccess<{ order: OrderDto }>>(
    "/orders/checkout",
    data,
  );
  return response.data.data;
};

export const listOrdersService = async (params: OrderListParams) => {
  const response = await api.get<ApiSuccess<OrderDto[]>>("/orders", {
    params,
  });
  return {
    items: response.data.data,
    meta: response.data.meta,
  };
};

export const getOrderService = async (orderId: string) => {
  const response = await api.get<ApiSuccess<OrderDto>>(`/orders/${orderId}`);
  return response.data.data;
};

export const cancelOrderService = async (orderId: string) => {
  const response = await api.post<ApiSuccess<OrderDto>>(
    `/orders/${orderId}/cancel`,
  );
  return response.data.data;
};
