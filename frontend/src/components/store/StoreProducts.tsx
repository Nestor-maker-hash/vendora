"use client";

import { useMemo } from "react";

import ProductCard from "@/src/features/products/components/ProductCard";
import type { Product } from "@/src/features/products/types/product";

type StorefrontProduct = Product & {
  isLocked: boolean;
};

interface Props {
  slug: string;
  products: Product[];
  search: string;
  currency: string;
  productLimit: number | null;
  lockOverLimitProducts: boolean;
}

export default function StoreProducts({
  slug,
  products,
  search,
  currency,
  productLimit,
  lockOverLimitProducts,
}: Props) {
  const storefrontProducts = useMemo<StorefrontProduct[]>(() => {
    return products.map((product, index) => ({
      ...product,
      isLocked:
        lockOverLimitProducts &&
        productLimit !== null &&
        index >= productLimit,
    }));
  }, [
    products,
    productLimit,
    lockOverLimitProducts,
  ]);

  const filteredProducts = useMemo(() => {
    const q = (search ?? "").toLowerCase().trim();

    if (!q) return storefrontProducts;

    return storefrontProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q)
      );
    });
  }, [storefrontProducts, search]);

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Collection
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Shop our products
          </h2>
        </div>

        <p className="shrink-0 text-xs font-medium text-slate-400 sm:text-sm">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "product" : "products"}
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
            🔎
          </div>

          <h2 className="mt-5 text-xl font-semibold text-slate-900">
            No products found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            We couldn't find anything matching your search.
            Try a different product name or keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              mode="store"
              currency={currency}
              href={`/store/${slug}/product/${product.id}`}
              isLocked={product.isLocked}
            />
          ))}
        </div>
      )}
    </section>
  );
}
