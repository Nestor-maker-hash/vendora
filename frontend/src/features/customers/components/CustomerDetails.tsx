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
      <div className="space-y-5 sm:space-y-8">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-gray-200 sm:h-9 sm:w-52" />
          <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 h-6 w-32 animate-pulse rounded bg-gray-200" />

          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border p-3 sm:p-4"
              >
                <div className="space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                </div>

                <div className="space-y-2">
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="ml-auto h-3 w-14 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
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
    <div className="min-w-0 space-y-5 sm:space-y-8">

      {/* Customer Information */}

      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {data.customer.name}
        </h1>

        <p className="mt-1 text-sm text-gray-500 sm:mt-2 sm:text-base">
          {data.customer.phone}
        </p>

        {data.customer.email && (
          <p className="text-sm text-gray-500 sm:text-base">
            {data.customer.email}
          </p>
        )}
      </div>

      {/* Statistics */}

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">
            Total Orders
          </p>

          <h2 className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">
            {data.stats.totalOrders}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">
            Lifetime Value
          </p>

          <h2 className="mt-2 break-words text-2xl font-bold text-emerald-600">
            {formatCurrency(data.stats.totalSpent, currency)}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">
            Completed Orders
          </p>

          <h2 className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">
            {data.stats.completedOrders}
          </h2>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm text-gray-500">
            Pending Orders
          </p>

          <h2 className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">
            {data.stats.pendingOrders}
          </h2>
        </div>

      </div>

      {/* Order History */}

      <div className="min-w-0 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">

        <h2 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
          Order History
        </h2>

        <div className="space-y-3 sm:space-y-4">

          {data.orders.map((order: Order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex min-w-0 items-center justify-between gap-3 rounded-xl border p-3 transition hover:bg-gray-50 sm:p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  Order #{order.id.slice(0, 8)}
                </p>

                <p className="text-sm text-gray-500">
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="min-w-0 text-right">
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
