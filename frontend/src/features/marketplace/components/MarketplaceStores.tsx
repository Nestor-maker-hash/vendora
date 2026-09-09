import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import type { MarketplaceBusiness } from "../types/marketplace";
import { formatBusinessLocation } from "@/src/lib/formatBusinessLocation";

interface Props {
  stores: MarketplaceBusiness[];
}

export default function MarketplaceStores({ stores }: Props) {
  if (stores.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            Stores
          </p>

          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Explore stores
          </h2>
        </div>

        <span className="text-xs text-slate-400">
          {stores.length} {stores.length === 1 ? "store" : "stores"}
        </span>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {stores.map((store) => {
          const location = formatBusinessLocation(store);

          return (
            <Link
              key={store.id}
              href={`/store/${store.slug}`}
              className="group w-[230px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="relative h-24 overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-800">
                {store.banner_url ? (
                  <img
                    src={store.banner_url}
                    alt={`${store.name} banner`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_40%)]" />
                )}
              </div>

              <div className="relative p-3.5">
                <div className="-mt-7 mb-2.5">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={`${store.name} logo`}
                      className="h-14 w-14 rounded-xl border-4 border-white bg-white object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border-4 border-white bg-emerald-600 text-xl font-bold text-white shadow-md">
                      {store.name.charAt(0).toUpperCase() || (
                        <Store size={20} />
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {store.name}
                    </h3>

                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                      {store.category || "Vendora store"}
                    </p>

                    {location && (
                      <p className="mt-1 truncate text-[9px] text-slate-400">
                        {location}
                      </p>
                    )}
                  </div>

                  <ArrowRight
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
