"use client";

import { useState } from "react";
import StoreNavbar from "./StoreNavbar";
import StoreProducts from "./StoreProducts";
import { Product } from "@/src/features/products/types/product";

interface Business {
  id: string;
  name: string;
  currency: string;
  description?: string | null;

  logo_url?: string | null;
  banner_url?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
}

interface Props {
  slug: string;
  business: Business;
  products: Product[];
  productLimit: number | null;
  lockOverLimitProducts: boolean;
}

export default function StorePageClient({
  slug,
  business,
  products,
  productLimit,
  lockOverLimitProducts,
}: Props) {
  const [search, setSearch] = useState("");

  return (
    <>
      <StoreNavbar
	business={business}
        storeName={business.name}
	storeHref={`/store/${slug}`}
        search={search}
        onSearchChange={setSearch}
      />

      <main className="min-h-screen bg-slate-50 pb-24 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">

          <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Store banner */}
            <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 sm:h-44">

              {business.banner_url ? (
                <img
                  src={business.banner_url}
                  alt={`${business.name} banner`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_30%)]" />

                  <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10 bg-white/5" />

                  <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full border border-white/10 bg-white/5" />
                </>
              )}

              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" />
            </div>

            {/* Store identity */}
            <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">

              <div className="-mt-9 mb-3 sm:-mt-12 sm:mb-4">

                {business.logo_url ? (
                  <img
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                    className="h-18 w-18 rounded-xl border-3 border-white bg-white object-cover shadow-xl sm:h-24 sm:w-24 sm:rounded-2xl"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-emerald-600 text-3xl font-bold text-white shadow-xl sm:h-24 sm:w-24 sm:rounded-2xl sm:text-4xl">
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                )}

              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div className="min-w-0">

                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    Official Store
                  </p>

                  <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    {business.name}
                  </h1>

                  {business.description && (
                    <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                      {business.description}
                    </p>
                  )}

                </div>

                <div className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Shopping on Vendora
                </div>

              </div>

            </div>

          </header>

          <StoreProducts
  slug={slug}
  products={products}
  search={search}
  currency={business.currency}
  productLimit={productLimit}
  lockOverLimitProducts={
    lockOverLimitProducts
  }
/>

        </div>
      </main>
    </>
  );
}
