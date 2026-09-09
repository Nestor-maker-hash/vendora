import MarketplaceNavbar from "@/src/features/marketplace/components/MarketplaceNavbar";
import MarketplaceProductCard from "@/src/features/marketplace/components/MarketplaceProductCard";
import MarketplaceSearch from "@/src/features/marketplace/components/MarketplaceSearch";
import MarketplaceStores from "@/src/features/marketplace/components/MarketplaceStores";
import { getMarketplace } from "@/src/features/marketplace/services/getMarketplace";
import { searchMarketplace } from "@/src/features/marketplace/services/searchMarketplace";
import { Package, Store } from "lucide-react";
import Link from "next/link";

interface MarketplacePageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function MarketplacePage({
  searchParams,
}: MarketplacePageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const marketplace = search
    ? null
    : await getMarketplace();

  const searchResults = search
    ? await searchMarketplace(search)
    : null;

  const products =
    searchResults?.products ?? marketplace?.products ?? [];

  const stores =
    searchResults?.businesses ?? marketplace?.businesses ?? [];

  return (
    <>
      <MarketplaceNavbar />

      <main className="min-h-screen bg-slate-50 pb-24 text-slate-900 lg:pb-0">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                Vendora Marketplace
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                Discover products. Discover stores.
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
                Find products from businesses selling on Vendora
                and shop directly from their stores.
              </p>

              <MarketplaceSearch initialSearch={search} />

            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          {search && (
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  Search results for
                </p>

                <h2 className="mt-0.5 text-lg font-bold">
                  “{search}”
                </h2>
              </div>

              <Link
                href="/marketplace"
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                Clear search
              </Link>
            </div>
          )}

          <MarketplaceStores stores={stores.slice(0, 12)} />

          <section className={stores.length > 0 ? "mt-12" : ""}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                  Products
                </p>

                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  Explore products
                </h2>
              </div>

              <span className="text-xs text-slate-400">
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </span>
            </div>

            {products.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {products.map((product) => (
                  <MarketplaceProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <Package
                  size={32}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-bold text-slate-900">
                  No products found
                </h3>

                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  Try another product or store name.
                </p>

                <Link
                  href="/marketplace"
                  className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Explore all products
                </Link>
              </div>
            )}
          </section>

          {marketplace &&
            marketplace.products.length === 0 &&
            marketplace.businesses.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
                <Store
                  size={36}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-bold">
                  The marketplace is getting ready.
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Businesses and products will appear here as
                  they become available.
                </p>
              </div>
            )}
        </div>
      </main>
    </>
  );
}
