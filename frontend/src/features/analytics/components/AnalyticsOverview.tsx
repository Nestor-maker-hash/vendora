"use client";

import { useAnalytics } from "../hooks/useAnalytics";
import { formatCurrency } from "@/src/utils/formatCurrency";
import RevenueChart from "./RevenueChart";
import TopProducts from "./TopProducts";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="h-3 w-20 animate-pulse rounded bg-gray-200 sm:h-4" />
      <div className="mt-2.5 h-6 w-28 animate-pulse rounded bg-gray-200 sm:mt-3 sm:h-8" />
    </div>
  );
}

export default function AnalyticsOverview() {
  const {
    analytics,
    loading,
    error,
  } = useAnalytics();

  const { currency } = useBusiness();

  if (loading) {
    return (
      <div className="space-y-5 sm:space-y-8">
        <div>
          <div className="h-7 w-32 animate-pulse rounded bg-gray-200 sm:h-9" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <MetricSkeleton key={index} />
          ))}
        </div>

        <div className="rounded-xl border bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200 sm:h-6" />
          <div className="mt-1.5 h-3 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-5 h-56 animate-pulse rounded-xl bg-gray-100 sm:h-80" />
        </div>

        <div className="rounded-xl border bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-200 sm:h-6" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 sm:rounded-2xl sm:p-6">
        <h2 className="text-sm font-semibold text-red-700 sm:text-base">
          Unable to load analytics
        </h2>
        <p className="mt-1 text-xs text-red-600 sm:text-sm">
          {error}
        </p>
      </div>
    );
  }

  const metrics = [
    {
      title: "Revenue",
      value: formatCurrency(
        analytics.revenue,
        currency
      ),
    },
    {
      title: "Orders",
      value: analytics.orders.toString(),
    },
    {
      title: "Customers",
      value: analytics.customers.toString(),
    },
    {
      title: "Products",
      value: analytics.products.toString(),
    },
    {
      title: "Completed",
      value: analytics.completedOrders.toString(),
    },
    {
      title: "Pending",
      value: analytics.pendingOrders.toString(),
    },
    {
      title: "Average Order",
      value: formatCurrency(
        analytics.averageOrderValue,
        currency
      ),
    },
    {
      title: "Low Stock",
      value: analytics.lowStockProducts.toString(),
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-8">
      <div>
        <h1 className="text-xl font-bold sm:text-3xl">
          Analytics
        </h1>

        <p className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-base">
          Understand how your business is performing.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.title}
            className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-5"
          >
            <p className="text-[10px] font-medium text-gray-500 sm:text-sm">
              {metric.title}
            </p>

            <p className="mt-1.5 break-words text-base font-bold leading-tight text-gray-900 sm:mt-3 sm:text-2xl lg:text-3xl">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <RevenueChart
        data={analytics.revenueHistory}
        currency={currency}
      />

      <TopProducts
        products={analytics.topProducts}
        currency={currency}
      />
    </div>
  );
}
