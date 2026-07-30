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
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        🏆 Top Selling Products
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-500">
          No sales yet.
        </p>
      ) : (
        <div className="space-y-5">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="flex items-center justify-between border-b pb-4 last:border-none"
            >
              <div>
                <p className="font-semibold">
                  {index + 1}. {product.name}
                </p>

                <p className="text-sm text-gray-500">
                  {product.quantity} sold
                </p>
              </div>

              <p className="font-semibold text-emerald-600">
                {formatCurrency(product.revenue, currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
