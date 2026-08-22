import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Package,
  ShoppingCart,
  Store,
} from "lucide-react";
import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalMerchants } from "@/src/features/immortal/services/getImmortalMerchants";

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatCurrency(
  value: number,
  currency = "NGN"
) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function ImmortalMerchantsPage() {
  await getImmortalAccess();

  const merchants = await getImmortalMerchants();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Platform
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Merchants
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Every business operating on Vendora.
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-500">
              Total Merchants
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {formatNumber(merchants.length)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-500">
              Stores Ready
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {
                merchants.filter(
                  (merchant) =>
                    merchant.store_ready_acknowledged
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-500">
              Stores Still Setting Up
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-400">
              {
                merchants.filter(
                  (merchant) =>
                    !merchant.store_ready_acknowledged
                ).length
              }
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">Order Value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {merchants.map((merchant) => (
                  <tr
                    key={merchant.id}
                    className="transition hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                          <Store size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {merchant.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {merchant.email ??
                              merchant.phone ??
                              "No contact"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-300">
                        {merchant.subscription?.planName ??
                          "No subscription"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-300">
                      <span className="flex items-center gap-2">
                        <Package size={15} />
                        {formatNumber(merchant.productCount)}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-300">
                      <span className="flex items-center gap-2">
                        <ShoppingCart size={15} />
                        {formatNumber(merchant.orderCount)}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-white">
		{formatCurrency(
  merchant.revenue,
  merchant.currency
)}
                    </td>

                    <td className="px-6 py-5">
                      {merchant.store_ready_acknowledged ? (
                        <span className="text-xs font-medium text-emerald-400">
                          ● Ready
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-400">
                          ● Setup
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
			  <div className="flex justify-end gap-2">
			    <Link
			      href={`/store/${merchant.slug}`}
			      target="_blank"
			      rel="noopener noreferrer"
			      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:border-emerald-500 hover:bg-emerald-500/10"
			    >
			      Visit Store
			      <ExternalLink size={14} />
			    </Link>
			
			    <Link
			      href={`/immortal/merchants/${merchant.id}`}
			      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-emerald-500 hover:text-emerald-400"
			    >
			      Inspect
			      <ArrowRight size={14} />
			    </Link>
			  </div>
			</td>
                  </tr>
                ))}

                {merchants.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      No merchants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
