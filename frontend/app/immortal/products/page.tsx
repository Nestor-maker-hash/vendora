import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  Package,
  XCircle,
} from "lucide-react";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { getImmortalProducts } from "@/src/features/immortal/services/getImmortalProducts";

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

export default async function ImmortalProductsPage() {
  await getImmortalAccess();

  const products = await getImmortalProducts();

  const totalProducts = products.length;

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 5
  );

  const outOfStock = products.filter(
    (product) => product.stock <= 0
  );

  const inventoryByCurrency = new Map<string, number>();

  for (const product of products) {
    const currency = product.business?.currency ?? "NGN";
    const value = Number(product.price) * Math.max(Number(product.stock), 0);

    inventoryByCurrency.set(
      currency,
      (inventoryByCurrency.get(currency) ?? 0) + value
    );
  }

  const inventoryValues = Array.from(
    inventoryByCurrency.entries()
  );

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Platform
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Products
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Every product and inventory position across Vendora.
          </p>
        </div>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total Products"
            value={formatNumber(totalProducts)}
            icon={Package}
          />

          <Stat
            label="Low Stock"
            value={formatNumber(lowStock.length)}
            icon={AlertTriangle}
            valueClass="text-amber-400"
          />

          <Stat
            label="Out of Stock"
            value={formatNumber(outOfStock.length)}
            icon={XCircle}
            valueClass="text-red-400"
          />

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm text-slate-500">
                  Inventory Value
                </p>

                {inventoryValues.length === 0 ? (
                  <p className="mt-3 text-2xl font-bold text-white">
                    —
                  </p>
                ) : (
                  <div className="mt-3 space-y-1">
                    {inventoryValues.map(([currency, value]) => (
                      <p
                        key={currency}
                        className="truncate text-lg font-bold tracking-tight text-white"
                      >
                        {formatCurrency(value, currency)}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                <CircleDollarSign
                  size={19}
                  className="text-emerald-400"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Min. Order</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {products.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock =
                    product.stock > 0 && product.stock <= 5;

                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Boxes size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-white">
                              {product.name}
                            </p>

                            {product.description && (
                              <p className="max-w-[260px] truncate text-xs text-slate-600">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {product.business ? (
                          <Link
                            href={`/immortal/merchants/${product.business.id}`}
                            className="transition hover:text-emerald-400"
                          >
                            <p className="font-medium text-slate-300">
                              {product.business.name}
                            </p>

                            <p className="text-xs text-slate-600">
                              {product.business.slug
                                ? `/${product.business.slug}`
                                : "—"}
                            </p>
                          </Link>
                        ) : (
                          <p className="text-sm text-slate-500">
                            Unknown merchant
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(
                            Number(product.price),
                            product.business?.currency ?? "NGN"
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p
                          className={`text-sm font-semibold ${
                            isOutOfStock
                              ? "text-red-400"
                              : isLowStock
                                ? "text-amber-400"
                                : "text-slate-300"
                          }`}
                        >
                          {formatNumber(Number(product.stock))}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-400">
                        {formatNumber(
                          Number(product.minimum_order_quantity)
                        )}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {formatDate(product.created_at)}
                      </td>

                      <td className="px-6 py-5">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-400">
                            <XCircle size={13} />
                            Out of stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                            <AlertTriangle size={13} />
                            Low stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                            <Package size={13} />
                            In stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-600">
          {formatNumber(totalProducts)} products across the platform.
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
  icon: typeof Package;
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
