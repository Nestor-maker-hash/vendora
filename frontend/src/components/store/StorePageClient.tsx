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

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl p-6">
          <header className="mb-10 overflow-hidden rounded-3xl bg-white shadow-sm">

  {/* Banner */}

  <div className="relative h-56 w-full bg-gradient-to-r from-emerald-500 to-emerald-700">

    {business.banner_url && (
      <img
        src={business.banner_url}
        alt="Store Banner"
        className="h-full w-full object-cover"
      />
    )}

  </div>

  <div className="relative px-8 pb-8">

    {/* Logo */}

    <div className="-mt-16 mb-4">

      {business.logo_url ? (

        <img
          src={business.logo_url}
          alt="Store Logo"
          className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
        />

      ) : (

        <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-4xl font-bold text-white shadow-lg">

          {business.name.charAt(0)}

        </div>

      )}

    </div>

    <h1 className="text-3xl font-bold">
      {business.name}
    </h1>

    {business.description && (
      <p className="mt-3 max-w-2xl text-gray-600">
        {business.description}
      </p>
    )}

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
