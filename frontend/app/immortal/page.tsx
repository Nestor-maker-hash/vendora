import {
  Activity,
  AlertTriangle,
  Bell,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Smartphone,
  Store,
  Users,
} from "lucide-react";
import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalOverview } from "@/src/features/immortal/services/getImmortalOverview";

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatCurrency(value: number) {
  return `₦${value.toLocaleString()}`;
}

export default async function ImmortalPage() {
  const { user } = await getImmortalAccess();
  const overview = await getImmortalOverview();

  const stats = [
    {
      label: "Merchants",
      value: overview.merchants,
      icon: Store,
    },
    {
      label: "Orders",
      value: overview.orders,
      icon: ShoppingCart,
    },
    {
      label: "Products",
      value: overview.products,
      icon: Package,
    },
    {
      label: "Customers",
      value: overview.customers,
      icon: Users,
    },
    {
	label: "Paid Order Value",
	value: formatCurrency(overview.paidOrderValue),
      icon: DollarSign,
    },
    {
      label: "Active Subscriptions",
      value: overview.activeSubscriptions,
      icon: CreditCard,
    },
    {
      label: "Push Devices",
      value: overview.activePushDevices,
      icon: Smartphone,
    },
    {
      label: "Unread Notifications",
      value: overview.unreadNotifications,
      icon: Bell,
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            <Activity size={14} />
            System Overview
          </div>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Good to see you, Commander.
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Here's what's happening across Vendora.
              </p>
            </div>

            <p className="text-xs text-slate-600">
              {user.email}
            </p>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(
            ({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {label}
                    </p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-white">
                      {typeof value === "number"
                        ? formatNumber(value)
                        : value}
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
            )
          )}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5">
                <AlertTriangle
                  size={19}
                  className="text-amber-400"
                />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Attention Required
                </h2>

                <p className="text-xs text-slate-500">
                  Items that may need your attention
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <span className="text-sm text-slate-400">
                  Pending orders
                </span>

                <span className="font-semibold text-white">
                  {formatNumber(
                    overview.pendingOrders
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <span className="text-sm text-slate-400">
                  Low stock products
                </span>

                <span className="font-semibold text-amber-400">
                  {formatNumber(
                    overview.lowStockProducts
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <span className="text-sm text-slate-400">
                  Unread notifications
                </span>

                <span className="font-semibold text-white">
                  {formatNumber(
                    overview.unreadNotifications
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5">
                <Activity
                  size={19}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Platform Status
                </h2>

                <p className="text-xs text-slate-500">
                  Core Vendora systems
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                ["Authentication", "Operational"],
                ["Merchant Platform", "Operational"],
                ["Order System", "Operational"],
                ["Notification System", "Operational"],
              ].map(([system, status]) => (
                <div
                  key={system}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                >
                  <span className="text-sm text-slate-400">
                    {system}
                  </span>

                  <span className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
