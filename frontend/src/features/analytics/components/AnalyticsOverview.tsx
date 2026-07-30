"use client";

import { useAnalytics } from "../hooks/useAnalytics";
import { formatCurrency } from "@/src/utils/formatCurrency";
import StatCard from "@/src/components/dashboard/StatCard";
import RevenueChart from "./RevenueChart";
import TopProducts from "./TopProducts";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

export default function AnalyticsOverview() {
  const { analytics, loading } = useAnalytics();
  const { currency } = useBusiness();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Revenue" value="..." />
        <StatCard title="Orders" value="..." />
        <StatCard title="Customers" value="..." />
        <StatCard title="Products" value="..." />
      </div>
    );
  }

  return (
   <>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Revenue"
        value={formatCurrency(analytics.revenue, currency)}
      />

      <StatCard
        title="Orders"
        value={analytics.orders.toString()}
      />

      <StatCard
        title="Customers"
        value={analytics.customers.toString()}
      />

      <StatCard
        title="Products"
        value={analytics.products.toString()}
      />

      <StatCard
        title="Completed"
        value={analytics.completedOrders.toString()}
      />

      <StatCard
        title="Pending"
        value={analytics.pendingOrders.toString()}
      />

      <StatCard
        title="Average Order"
        value={formatCurrency(
  analytics.averageOrderValue,
  currency
)}
      />

      <StatCard
        title="Low Stock"
        value={analytics.lowStockProducts.toString()}
      />

    </div>

    <RevenueChart
  data={analytics.revenueHistory}
  currency={currency}
/>

<div className="mt-8">
  <TopProducts
    products={analytics.topProducts}
   currency={currency}
  />
</div>
  </>
);
}
