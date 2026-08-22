import {
  Mail,
  Phone,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalCustomers } from "@/src/features/immortal/services/getImmortalCustomers";

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
    return `${currency} ${value.toLocaleString()}`;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ImmortalCustomersPage() {
  await getImmortalAccess();

  const customers = await getImmortalCustomers();

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.orders,
    0
  );

  const returningCustomers = customers.filter(
    (customer) => customer.orders > 1
  ).length;

  const merchantsWithCustomers = new Set(
    customers.flatMap((customer) =>
      customer.merchants.map((merchant) => merchant.name)
    )
  ).size;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Platform
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Customers
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Customers buying from businesses across Vendora.
          </p>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total Customers"
            value={formatNumber(customers.length)}
            icon={Users}
          />

          <Stat
            label="Total Orders"
            value={formatNumber(totalOrders)}
            icon={ShoppingCart}
          />

          <Stat
            label="Returning Customers"
            value={formatNumber(returningCustomers)}
            icon={Users}
            valueClass="text-emerald-400"
          />

          <Stat
            label="Businesses Reached"
            value={formatNumber(merchantsWithCustomers)}
            icon={Store}
          />
        </section>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Businesses</th>
                  <th className="px-6 py-4">Spending</th>
                  <th className="px-6 py-4">Last Order</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {customers.map((customer) => (
                  <tr
                    key={customer.phone}
                    className="transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                          <Users size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {customer.name}
                          </p>

                          <p className="font-mono text-xs text-slate-600">
                            {customer.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Phone size={14} />
                          {customer.phone}
                        </div>

                        {customer.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail size={13} />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <ShoppingCart size={15} />
                        {formatNumber(customer.orders)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="flex items-center gap-2 text-sm text-slate-300">
                        <Store size={15} />
                        {formatNumber(customer.merchantCount)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      {customer.merchants.length === 0 ? (
                        <span className="text-sm text-slate-500">
                          —
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {customer.merchants.map((merchant) => (
                            <div
                              key={merchant.name}
                              className="text-sm font-medium text-white"
                            >
                              {formatCurrency(
                                merchant.spent,
                                merchant.currency
                              )}
                              <span className="ml-2 text-[10px] text-slate-600">
                                {merchant.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500">
                      {formatDate(customer.lastOrder)}
                    </td>
                  </tr>
                ))}

                {customers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          {formatNumber(customers.length)} customers across the platform.
        </p>
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
  icon: typeof Users;
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
