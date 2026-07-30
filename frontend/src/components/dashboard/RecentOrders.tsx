"use client";

import Link from "next/link";
import { useRecentOrders } from "@/src/features/orders/hooks/useRecentOrders";
import { formatCurrency } from "@/src/utils/formatCurrency";

export default function RecentOrders() {
  const { orders, loading } = useRecentOrders();

  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Recent Orders
        </h2>

        <p className="mt-4 text-gray-500">
          Loading orders...
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest customer orders
          </p>
        </div>

        <Link
          href="/dashboard/orders"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          View All →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-gray-500">
            No orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border p-5 transition hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {order.customer_name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {order.customer_phone}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "confirmed"
                      ? "bg-blue-100 text-blue-700"
                      : order.status === "shipped"
                      ? "bg-purple-100 text-purple-700"
                      : order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-emerald-600">
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
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
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
