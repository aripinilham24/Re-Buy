import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import type { CheckoutInput } from "@rebuy/contracts";
import { getErrorMessage } from "@/lib/errors";
import {
  cancelOrderService,
  checkoutService,
  getOrderService,
  getQuoteService,
  listOrdersService,
  type OrderListParams,
} from "../services/orderServices";

export const useQuote = (couponCode?: string, enabled = true) =>
  useQuery({
    queryKey: ["order-quote", couponCode],
    queryFn: () => getQuoteService(couponCode),
    enabled,
    retry: false,
  });

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutInput) => checkoutService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-quote"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Checkout gagal")),
  });
};

export const useOrders = (params: OrderListParams) =>
  useInfiniteQuery({
    queryKey: ["orders", params],
    queryFn: ({ pageParam }) =>
      listOrdersService({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.nextCursor ?? undefined,
  });

export const useOrder = (orderId: string) =>
  useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrderService(orderId),
    enabled: Boolean(orderId),
  });

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrderService(orderId),
    onSuccess: (order) => {
      toast.success("Pesanan dibatalkan");
      queryClient.setQueryData(["order", order.orderId], order);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal membatalkan pesanan")),
  });
};
