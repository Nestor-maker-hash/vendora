"use client";

import Link from "next/link";
import { useRecentOrders } from "@/src/features/orders/hooks/useRecentOrders";
import { formatCurrency } from "@/src/utils/formatCurrency";
import OrderStatusBadge from "./OrderStatusBadge";

function RecentOrderSkeleton() {
  return (
    <div className="rounded-xl border p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 sm:mt-5 sm:gap-4">
        <div>
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

export default function RecentOrders() {
  const { orders, loading } = useRecentOrders();

  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">
            Recent Orders
          </h2>

          <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
            Latest customer orders
          </p>
        </div>

        <Link
          href="/dashboard/orders"
          className="text-xs font-medium text-emerald-600 hover:underline sm:text-sm"
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          <RecentOrderSkeleton />
          <RecentOrderSkeleton />
          <RecentOrderSkeleton />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-gray-500">
            No orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border p-4 transition hover:border-emerald-300 hover:shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {order.customer_name}
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500 sm:mt-1 sm:text-sm">
                    {order.customer_phone}
                  </p>
                </div>

                <OrderStatusBadge status={order.status} />
              </div>

              <div className="mt-3 flex items-center justify-between sm:mt-4">
                <div>
                  <p className="text-lg font-bold text-emerald-600 sm:text-xl">
                    {formatCurrency(
                      Number(order.total),
                      order.business.currency
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
