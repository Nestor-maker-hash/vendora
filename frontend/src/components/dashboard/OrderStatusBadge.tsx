import type { OrderStatus } from "@/src/features/orders/types/order";

interface Props {
  status: OrderStatus | string;
}

const statusStyles: Record<
  OrderStatus,
  string
> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderStatusBadge({
  status,
}: Props) {
  const normalizedStatus =
    status.toLowerCase() as OrderStatus;

  const label =
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1);

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[normalizedStatus] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
}
