import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  XCircle,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalSubscriptions } from "@/src/features/immortal/services/getImmortalSubscriptions";
import { getImmortalPlans } from "@/src/features/immortal/services/getImmortalPlans";
import ImmortalPlansManager from "@/src/features/immortal/components/ImmortalPlansManager";
import ImmortalPlatformSettings from "@/src/features/immortal/components/ImmortalPlatformSettings";
import { getPlatformSettings } from "@/src/features/platform/services/getPlatformSettings";

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatCurrency(
  value: number,
  currency = "NGN"
) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "No expiry";
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusClass(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-500/10 text-emerald-400";

    case "cancelled":
      return "bg-red-500/10 text-red-400";

    case "expired":
      return "bg-red-500/10 text-red-400";

    case "past_due":
      return "bg-amber-500/10 text-amber-400";

    default:
      return "bg-slate-800 text-slate-300";
  }
}

export default async function ImmortalSubscriptionsPage() {
  await getImmortalAccess();


const [plans, subscriptions, platformSettings] =
  await Promise.all([
    getImmortalPlans(),
    getImmortalSubscriptions(),
    getPlatformSettings(),
  ]);

  const active = subscriptions.filter(
    (subscription) => subscription.status === "active"
  );

  const expired = subscriptions.filter(
    (subscription) => subscription.status === "expired"
  );

  const cancelled = subscriptions.filter(
    (subscription) => subscription.status === "cancelled"
  );

  const monthlyRevenueByCurrency =
    new Map<string, number>();

  for (const subscription of active) {
    if (!subscription.plan) {
      continue;
    }

    const currency =
      subscription.business?.currency ?? "NGN";

    const current =
      monthlyRevenueByCurrency.get(currency) ?? 0;

    monthlyRevenueByCurrency.set(
      currency,
      current + Number(subscription.plan.monthly_price ?? 0)
    );
  }

  const monthlyRevenue =
    Array.from(monthlyRevenueByCurrency.entries());

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Platform
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Subscriptions
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Plans and subscription status across Vendora.
          </p>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total Subscriptions"
            value={formatNumber(subscriptions.length)}
            icon={CreditCard}
          />

          <Stat
            label="Active"
            value={formatNumber(active.length)}
            icon={CheckCircle2}
            valueClass="text-emerald-400"
          />

          <Stat
            label="Expired"
            value={formatNumber(expired.length)}
            icon={Clock3}
            valueClass="text-amber-400"
          />

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm text-slate-500">
                  Active Monthly Value
                </p>

                <div className="mt-3 space-y-1">
                  {monthlyRevenue.length === 0 ? (
                    <p className="text-2xl font-bold text-white">
                      —
                    </p>
                  ) : (
                    monthlyRevenue.map(
                      ([currency, value]) => (
                        <p
                          key={currency}
                          className="text-lg font-bold tracking-tight text-white"
                        >
                          {formatCurrency(
                            value,
                            currency
                          )}
                        </p>
                      )
                    )
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                <Crown
                  size={19}
                  className="text-emerald-400"
                />
              </div>
            </div>
          </div>
        </section>


        <ImmortalPlatformSettings
          initialLockOverLimitProducts={
            platformSettings.lock_over_limit_products
          }
        />

        <ImmortalPlansManager initialPlans={plans} />


        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Monthly Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Started</th>
                  <th className="px-6 py-4">Expires</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {subscriptions.map((subscription) => {
                  const currency =
                    subscription.business?.currency ??
                    "NGN";

                  return (
                    <tr
                      key={subscription.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-white">
                            {subscription.business?.name ??
                              "Unknown merchant"}
                          </p>

                          <p className="text-xs text-slate-600">
                            {subscription.business?.slug
                              ? `/${subscription.business.slug}`
                              : "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Crown size={15} />
                          </div>

                          <div>
                            <p className="font-medium text-white">
                              {subscription.plan?.name ??
                                "Unknown plan"}
                            </p>

                            <p className="text-xs text-slate-600">
                              {subscription.plan?.description ??
                                "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-white">
                          {subscription.plan
                            ? formatCurrency(
                                Number(
                                  subscription.plan
                                    .monthly_price
                                ),
                                currency
                              )
                            : "—"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass(
                            subscription.status
                          )}`}
                        >
                          {subscription.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(
                          subscription.started_at
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(
                          subscription.expires_at
                        )}
                      </td>
                    </tr>
                  );
                })}

                {subscriptions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      No subscriptions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
          <span>
            {formatNumber(active.length)} active
          </span>

          <span>
            {formatNumber(cancelled.length)} cancelled
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  valueClass = "text-white",
}: {
  label: string;
  value: string;
  icon: typeof CreditCard;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p
            className={`mt-3 text-2xl font-bold tracking-tight ${valueClass}`}
          >
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
