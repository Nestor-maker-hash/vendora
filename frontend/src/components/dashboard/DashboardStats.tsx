"use client";

import StatCard from "./StatCard";
import { useDashboardStats } from "@/src/features/dashboard/hooks/useDashboardStats";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-9 w-28 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

export default function DashboardStats() {
  const { stats, loading } = useDashboardStats();
  const { currency } = useBusiness();

  if (loading) {
    return (
      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    );
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4 lg:grid-cols-4">
      <StatCard
        title="Revenue"
        value={formatCurrency(stats.revenue, currency)}
        href="/analytics"
      />

      <StatCard
        title="Orders"
        value={stats.orders.toString()}
        href="/dashboard/orders"
      />

      <StatCard
        title="Customers"
        value={stats.customers.toString()}
        href="/customers"
      />

      <StatCard
        title="Products"
        value={stats.products.toString()}
        href="/products"
      />
    </div>
  );
}
