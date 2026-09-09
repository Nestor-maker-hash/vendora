import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import { getBuyerOrders } from "@/src/features/orders/services/getBuyerOrders";
import { formatCurrency } from "@/src/utils/formatCurrency";
import type { OrderStatus } from "@/src/features/orders/types/order";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusClasses: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-indigo-50 text-indigo-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function BuyerOrdersPage() {
  const orders = await getBuyerOrders();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/buyer"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            <span>My account</span>
          </Link>

          <Link href="/marketplace">
            <img
              src="/icon.png"
              alt="Vendora"
              className="h-9 w-9 rounded-xl object-cover"
            />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            Shopping history
          </p>

          <div className="mt-1.5 flex items-center gap-3">
            <ShoppingBag size={24} className="text-slate-900" />

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              My Orders
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            View your orders and track their progress.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <Package size={32} className="mx-auto text-slate-300" />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No orders yet
            </h2>

            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
              When you place an order on Vendora, it will appear here.
            </p>

            <Link
              href="/marketplace"
              className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-7 space-y-3 sm:mt-8 sm:space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/buyer/orders/${order.id}`}
                className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {order.customer_name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClasses[order.status]}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Total
                    </p>

                    <p className="mt-0.5 text-base font-extrabold text-slate-950">
                      {formatCurrency(
                        Number(order.total),
                        order.business.currency
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>

                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      Track order
                      <ChevronRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
