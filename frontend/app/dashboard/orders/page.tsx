"use client";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import OrdersSummary from "@/src/components/dashboard/OrdersSummary";
import OrdersList from "@/src/components/dashboard/OrdersList";
import { useOrders } from "@/src/features/orders/hooks/useOrders";

export default function OrdersPage() {
  const { orders, loading } = useOrders();

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <p>Loading orders...</p>
        </DashboardLayout>
      </AuthGuard>
    );
  }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Orders
          </h1>

          <p className="mt-2 text-gray-600">
            Manage customer orders.
          </p>
        </div>

        <OrdersSummary
          total={totalOrders}
          pending={pendingOrders}
          processing={processingOrders}
          delivered={deliveredOrders}
        />

        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-500">
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          <OrdersList orders={orders} />
        )}
      </DashboardLayout>
    </AuthGuard>
  );
}
