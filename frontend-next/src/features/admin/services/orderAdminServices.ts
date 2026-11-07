import type {
  ApiSuccess,
  OrderDto,
  OrderStatus,
  OrderStatusUpdateInput,
} from "@rebuy/contracts";
import api from "@/lib/axios";

export interface AdminOrderListParams {
  limit?: number;
  cursor?: string;
  status?: OrderStatus;
}

export const listAdminOrdersService = async (
  params: AdminOrderListParams,
) => {
  const response = await api.get<ApiSuccess<OrderDto[]>>("/admin/orders", {
    params,
  });
  return {
    items: response.data.data,
    meta: response.data.meta,
  };
};

export const getAdminOrderService = async (orderId: string) => {
  const response = await api.get<ApiSuccess<OrderDto>>(
    `/admin/orders/${orderId}`,
  );
  return response.data.data;
};

export const updateAdminOrderStatusService = async (
  orderId: string,
  data: OrderStatusUpdateInput,
) => {
  const response = await api.patch<ApiSuccess<OrderDto>>(
    `/admin/orders/${orderId}/status`,
    data,
  );
  return response.data.data;
};
