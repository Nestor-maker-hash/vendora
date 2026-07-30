"use client";

import Link from "next/link";
import { useCustomer } from "../hooks/useCustomer";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Order } from "@/src/features/orders/types/order";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

interface Props {
  phone: string;
}

export default function CustomerDetails({
  phone,
}: Props) {
  const { data, loading } = useCustomer(phone);
const { currency } = useBusiness();

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        Loading customer...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        Customer not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Customer Information */}

      <div>
        <h1 className="text-3xl font-bold">
          {data.customer.name}
        </h1>

        <p className="mt-2 text-gray-500">
          {data.customer.phone}
        </p>

        {data.customer.email && (
          <p className="text-gray-500">
            {data.customer.email}
          </p>
        )}
      </div>

      {/* Statistics */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {data.stats.totalOrders}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Lifetime Value
          </p>

          <h2 className="mt-2 break-words text-2xl font-bold text-emerald-600">
            {formatCurrency(data.stats.totalSpent, currency)}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Completed Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {data.stats.completedOrders}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Pending Orders
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {data.stats.pendingOrders}
          </h2>
        </div>

      </div>

      {/* Order History */}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">

        <h2 className="mb-6 text-xl font-semibold">
          Order History
        </h2>

        <div className="space-y-4">

          {data.orders.map((order: Order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between rounded-xl border p-4 transition hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold">
                  Order #{order.id.slice(0, 8)}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(order.total, currency)}
                </p>

                <p className="text-sm capitalize text-gray-500">
                  {order.status}
                </p>
              </div>
            </Link>
          ))}

        </div>

      </div>

    </div>
  );
}
