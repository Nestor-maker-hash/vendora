"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";

import { getBusinessOrders } from "@/src/features/orders/services/getBusinessOrders";
import { Order } from "@/src/features/orders/types/order";
import { formatCurrency } from "@/src/utils/formatCurrency";
import Link from "next/link";

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await getBusinessOrders({
          paymentMethod: "bank_transfer",
          paymentStatus: "pending",
        });

        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">

          <div>
            <h1 className="text-3xl font-bold">
              Payments
            </h1>

            <p className="mt-2 text-gray-500">
              Verify customer bank transfers.
            </p>
          </div>

          <div className="rounded-2xl border bg-white shadow-sm">

            <div className="border-b p-6">
              <h2 className="text-xl font-semibold">
                Awaiting Verification
              </h2>
            </div>

            {loading ? (

              <div className="p-8 text-center">
                Loading...
              </div>

            ) : orders.length === 0 ? (

              <div className="p-10 text-center text-gray-500">
                No pending payments.
              </div>

            ) : (

              <div className="divide-y">

                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-6"
                  >
                    <div>

                      <p className="font-semibold">
                        {order.customer_name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {order.customer_phone}
                      </p>

                    </div>

          <div className="text-right space-y-2">

  <p className="font-semibold">
    {formatCurrency(
      Number(order.total),
      order.business.currency
    )}
  </p>

  <p className="text-sm text-orange-600">
    Awaiting Verification
  </p>

  <Link
    href={`/dashboard/orders/${order.id}`}
    className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
  >
    View Order
  </Link>

</div>

                  </div>
                ))}

              </div>

            )}

          </div>

        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
