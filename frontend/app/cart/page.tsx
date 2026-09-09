"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  Store,
} from "lucide-react";

import { useCart } from "@/src/features/cart/context/CartContext";
import { CartItem } from "@/src/features/cart/types/cart";
import { Business } from "@/src/features/business/types/business";
import { getBusinessById } from "@/src/features/business/services/getBusinessById";
import StoreNavbar from "@/src/components/store/StoreNavbar";
import { formatCurrency } from "@/src/utils/formatCurrency";

export default function CartPage() {
  const {
    items,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    getBusinessIds,
  } = useCart();

  const [businesses, setBusinesses] = useState<
    Record<string, Business>
  >({});
  const [businessLoading, setBusinessLoading] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    setCartReady(true);
  }, []);

  /*
   * Load every business represented in the cart.
   * The cart is no longer tied to a single store.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadBusinesses() {
      const businessIds = getBusinessIds();

      if (businessIds.length === 0) {
        setBusinesses({});
        return;
      }

      setBusinessLoading(true);

      try {
        const results = await Promise.all(
          businessIds.map(async (businessId) => {
            try {
              const business = await getBusinessById(
                businessId
              );

              return [businessId, business as Business] as const;
            } catch (error) {
              console.error(
                `Failed to load business ${businessId}:`,
                error
              );

              return null;
            }
          })
        );

        if (cancelled) return;

        const nextBusinesses: Record<string, Business> = {};

        for (const result of results) {
          if (!result) continue;

          const [businessId, business] = result;
          nextBusinesses[businessId] = business;
        }

        setBusinesses(nextBusinesses);
      } finally {
        if (!cancelled) {
          setBusinessLoading(false);
        }
      }
    }

    loadBusinesses();

    return () => {
      cancelled = true;
    };
  }, [items, getBusinessIds]);

  /*
   * Group cart items by business.
   */
  const groupedItems = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};

    for (const item of items) {
      if (!groups[item.business_id]) {
        groups[item.business_id] = [];
      }

      groups[item.business_id].push(item);
    }

    return groups;
  }, [items]);

  const businessIds = Object.keys(groupedItems);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const fallbackBusiness =
    businessIds.length > 0
      ? businesses[businessIds[0]]
      : null;

  const navbarStoreHref =
    cartReady && fallbackBusiness?.slug
      ? `/store/${fallbackBusiness.slug}`
      : "/";

  return (
    <>
      {fallbackBusiness && (
        <StoreNavbar
          business={fallbackBusiness}
          storeName="Shopping Cart"
          storeHref={navbarStoreHref}
        />
      )}

      <main className="min-h-screen bg-slate-50 pb-24 lg:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">

          {/* Header */}
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Your selection
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Shopping Cart
              </h1>

              {items.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"} from{" "}
                  {businessIds.length}{" "}
                  {businessIds.length === 1
                    ? "business"
                    : "businesses"}
                </p>
              )}
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 size={13} />
                Clear Cart
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:rounded-3xl sm:px-8 sm:py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <ShoppingBag size={25} />
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                Your cart is empty
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500 sm:text-sm">
                Add products from Vendora stores and they will
                appear here.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
              >
                <ArrowLeft size={14} />
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-5">

              {businessLoading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
                  Loading store information...
                </div>
              )}

              {businessIds.map((businessId) => {
                const business = businesses[businessId];
                const businessItems =
                  groupedItems[businessId] ?? [];

                const currency =
                  business?.currency ?? "";

                const subtotal = businessItems.reduce(
                  (sum, item) =>
                    sum +
                    item.price * item.quantity,
                  0
                );

                const storeHref = business?.slug
                  ? `/store/${business.slug}`
                  : "/";

                const checkoutHref =
                  `/checkout?business=${encodeURIComponent(
                    businessId
                  )}`;

                return (
                  <section
                    key={businessId}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl"
                  >
                    {/* Business header */}
                    <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                      <Link
                        href={storeHref}
                        className="flex min-w-0 items-center gap-3"
                      >
                        {business?.logo_url ? (
                          <img
                            src={business.logo_url}
                            alt={`${business.name} logo`}
                            className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                            {business?.name
                              ?.charAt(0)
                              .toUpperCase() ?? (
                              <Store size={18} />
                            )}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                            Store
                          </p>

                          <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                            {business?.name ??
                              "Business"}
                          </h2>

                          <p className="text-[10px] text-slate-400">
                            {businessItems.length}{" "}
                            {businessItems.length === 1
                              ? "product"
                              : "products"}
                          </p>
                        </div>
                      </Link>

                      <Link
                        href={storeHref}
                        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        <Store size={12} />
                        Continue shopping with{" "}
                        {business?.name ?? "this store"}
                      </Link>
                    </div>

                    {/* Products */}
                    <div className="divide-y divide-slate-100">
                      {businessItems.map((item) => {
                        const minimumQuantity =
                          item.minimum_order_quantity ??
                          1;

                        return (
                          <div
                            key={item.id}
                            className="group flex gap-3 p-3 sm:gap-4 sm:p-4"
                          >
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xl text-slate-300">
                                  📦
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                                    {item.name}
                                  </h3>

                                  <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                                    {formatCurrency(
                                      item.price,
                                      currency
                                    )}{" "}
                                    each
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFromCart(
                                      item.id
                                    )
                                  }
                                  aria-label={`Remove ${item.name}`}
                                  className="shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      decreaseQuantity(
                                        item.id
                                      )
                                    }
                                    disabled={
                                      item.quantity <=
                                      minimumQuantity
                                    }
                                    aria-label="Decrease quantity"
                                    className="flex h-7 w-7 items-center justify-center text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <Minus size={12} />
                                  </button>

                                  <span className="min-w-7 text-center text-xs font-semibold text-slate-800">
                                    {item.quantity}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      increaseQuantity(
                                        item.id
                                      )
                                    }
                                    disabled={
                                      item.quantity >=
                                      item.stock
                                    }
                                    aria-label="Increase quantity"
                                    className="flex h-7 w-7 items-center justify-center text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                <p className="text-sm font-bold tracking-tight text-slate-950 sm:text-base">
                                  {formatCurrency(
                                    item.price *
                                      item.quantity,
                                    currency
                                  )}
                                </p>
                              </div>

                              {minimumQuantity > 1 && (
                                <p className="mt-1.5 text-[9px] font-medium text-slate-400">
                                  Minimum order:{" "}
                                  {minimumQuantity}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Business summary + actions */}
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:px-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Store subtotal
                          </p>

                          <p className="mt-1 text-lg font-bold tracking-tight text-slate-950">
                            {formatCurrency(
                              subtotal,
                              currency
                            )}
                          </p>
                        </div>

                        <Link
                          href={checkoutHref}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md"
                        >
                          Proceed to Checkout
                          <ArrowRight size={14} />
                        </Link>
                      </div>

                      <p className="mt-2 text-[10px] leading-4 text-slate-400">
                        Checkout for this store only. Other
                        businesses in your cart will remain
                        untouched.
                      </p>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
