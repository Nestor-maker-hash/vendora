import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  ShoppingCart,
  XCircle,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalOrders } from "@/src/features/immortal/services/getImmortalOrders";

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatCurrency(value: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₦${value.toLocaleString()}`;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusClass(status: string) {
  switch (status) {
    case "delivered":
      return "bg-emerald-500/10 text-emerald-400";

    case "cancelled":
      return "bg-red-500/10 text-red-400";

    case "pending":
      return "bg-amber-500/10 text-amber-400";

    default:
      return "bg-slate-800 text-slate-300";
  }
}

export default async function ImmortalOrdersPage() {
  await getImmortalAccess();

  const orders = await getImmortalOrders();

  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.total ?? 0),
    0
  );

  const pending = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.payment_status === "pending"
  ).length;

  const paid = orders.filter(
    (order) => order.payment_status === "paid"
  ).length;

  const cancelled = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Platform
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Orders
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Every order flowing through Vendora.
          </p>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total Orders"
            value={formatNumber(orders.length)}
            icon={ShoppingCart}
          />

          <Stat
            label="Order Value"
            value={formatCurrency(totalValue)}
            icon={CreditCard}
          />

          <Stat
            label="Pending"
            value={formatNumber(pending)}
            icon={Clock3}
          />

          <Stat
            label="Cancelled"
            value={formatNumber(cancelled)}
            icon={XCircle}
          />
        </section>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {orders.map((order) => {
                  const business = Array.isArray(order.businesses)
                    ? order.businesses[0]
                    : order.businesses;

                  return (
                    <tr
                      key={order.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950">
                            <Package
                              size={16}
                              className="text-slate-500"
                            />
                          </div>

                          <div>
                            <p className="font-mono text-xs text-slate-300">
                              {order.id.slice(0, 8)}
                            </p>

                            <p className="text-[11px] text-slate-600">
                              {order.payment_method ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-white">
                          {business?.name ?? "Unknown merchant"}
                        </p>

                        <p className="text-xs text-slate-600">
                          {business?.slug
                            ? `/${business.slug}`
                            : "—"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-300">
                          {order.customer_name}
                        </p>

                        <p className="text-xs text-slate-600">
                          {order.customer_phone}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(
                            Number(order.total),
                            business?.currency ?? "NGN"
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 text-xs font-medium ${
                            order.payment_status === "paid"
                              ? "text-emerald-400"
                              : order.payment_status === "failed"
                                ? "text-red-400"
                                : "text-amber-400"
                          }`}
                        >
                          {order.payment_status === "paid" ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock3 size={14} />
                          )}

                          {order.payment_status ?? "unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}

                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          {formatNumber(paid)} paid orders across the platform.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof ShoppingCart;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
          <Icon
            size={19}
            className="text-emerald-400"
          />
        </div>
      </div>
    </div>
  );
}
