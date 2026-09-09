"use client";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import OrdersSummary from "@/src/components/dashboard/OrdersSummary";
import OrdersList from "@/src/components/dashboard/OrdersList";
import { useOrders } from "@/src/features/orders/hooks/useOrders";

function OrdersSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5"
          >
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-7 w-14 animate-pulse rounded bg-gray-100" />
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col gap-2.5 rounded-xl border bg-white p-3 shadow-sm sm:gap-4 sm:rounded-2xl sm:p-4 md:flex-row">
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100 sm:h-12" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100 sm:h-12 md:w-44" />
      </div>

      {/* Orders skeleton */}
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="h-5 w-32 max-w-full animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="h-6 w-20 shrink-0 animate-pulse rounded-full bg-gray-100" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="h-4 w-full max-w-xs animate-pulse rounded bg-gray-100" />

              <div className="flex items-center justify-between gap-3">
                <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const {
    orders,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    retry,
  } = useOrders();

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const processingOrders = orders.filter(
    (order) =>
      order.status === "processing" ||
      order.status === "confirmed" ||
      order.status === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Manage customer orders.
          </p>
        </div>

        {loading ? (
          <OrdersSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm sm:rounded-2xl sm:p-10">
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Unable to load orders
            </h2>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              {error}
            </p>

            <button
              type="button"
              onClick={retry}
              className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <OrdersSummary
              total={totalOrders}
              pending={pendingOrders}
              processing={processingOrders}
              delivered={deliveredOrders}
            />

            {orders.length === 0 ? (
              <div className="rounded-xl border bg-white p-6 text-center shadow-sm sm:rounded-2xl sm:p-10">
                <h2 className="text-lg font-semibold sm:text-xl">
                  No orders yet
                </h2>

                <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-base">
                  Customer orders will appear here.
                </p>
              </div>
            ) : (
              <OrdersList
                orders={orders}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={loadMore}
              />
            )}
          </>
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
