"use client";

import StatCard from "./StatCard";
import { useDashboardStats } from "@/src/features/dashboard/hooks/useDashboardStats";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

export default function DashboardStats() {
  const { stats, loading } = useDashboardStats();
  const { currency } = useBusiness();

  if (loading) {
    return (
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Revenue" value="..." />
        <StatCard title="Orders" value="..." />
        <StatCard title="Customers" value="..." />
        <StatCard title="Products" value="..." />
      </div>
    );
  }
return (
  <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
