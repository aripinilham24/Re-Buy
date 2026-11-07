import type { OrderStatus } from "@rebuy/contracts";
import { cn } from "@/lib/utils";
import { orderStatusClasses, orderStatusLabels } from "@/lib/order-status";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        orderStatusClasses[status],
      )}
    >
      {orderStatusLabels[status]}
    </span>
  );
}
