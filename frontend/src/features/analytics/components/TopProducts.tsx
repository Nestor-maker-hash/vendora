"use client";

import { formatCurrency } from "@/src/utils/formatCurrency";

interface Product {
  name: string;
  quantity: number;
  revenue: number;
}

interface Props {
  products: Product[];
  currency: string;
}

export default function TopProducts({
  products,
  currency,
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold sm:text-xl">
            Top Selling Products
          </h2>

          <p className="mt-1 text-[10px] text-gray-500 sm:text-sm">
            Products generating the most sales.
          </p>
        </div>

        {products.length > 0 && (
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[9px] font-medium text-gray-600 sm:px-3 sm:text-xs">
            Top {products.length}
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center text-xs text-gray-500 sm:min-h-40 sm:text-sm">
          No sales yet.
        </div>
      ) : (
        <div className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-4">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="flex items-center gap-2.5 border-b pb-2.5 last:border-none last:pb-0 sm:gap-4 sm:pb-4"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 sm:h-9 sm:w-9 sm:text-xs">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold sm:text-sm">
                  {product.name}
                </p>

                <p className="mt-0.5 text-[9px] text-gray-500 sm:text-xs">
                  {product.quantity}{" "}
                  {product.quantity === 1
                    ? "unit"
                    : "units"}{" "}
                  sold
                </p>
              </div>

              <p className="shrink-0 text-xs font-semibold text-emerald-600 sm:text-sm">
                {formatCurrency(
                  product.revenue,
                  currency
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
