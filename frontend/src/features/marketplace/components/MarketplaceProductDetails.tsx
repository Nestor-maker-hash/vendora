"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useState } from "react";
import type { MarketplaceProduct } from "../types/marketplace";
import { useCart } from "@/src/features/cart/context/CartContext";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface Props {
  product: MarketplaceProduct;
  relatedProducts?: MarketplaceProduct[];
}

export default function MarketplaceProductDetails({
  product,
  relatedProducts = [],
}: Props) {
  const { addToCart } = useCart();

  const minimum = product.minimum_order_quantity ?? 1;

  const [quantity, setQuantity] = useState(minimum);
  const [added, setAdded] = useState(false);

  function add() {
    if (product.stock <= 0) return;

    const safeQuantity = Math.min(
      Math.max(quantity, minimum),
      product.stock
    );

    addToCart(product, safeQuantity);
    setQuantity(safeQuantity);
    setAdded(true);

    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <Link
          href="/marketplace"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft size={14} />
          Back to Marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Product image */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="aspect-square overflow-hidden bg-slate-100">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ShoppingCart
                    size={42}
                    className="text-slate-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Product information */}
          <div className="flex flex-col justify-center">
            {/* Store identity */}
            <Link
              href={`/store/${product.business.slug}`}
              className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
              aria-label={`View ${product.business.name} store`}
            >
              {product.business.logo_url ? (
                <img
                  src={product.business.logo_url}
                  alt={`${product.business.name} logo`}
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <Store size={13} />
              )}

              <span>{product.business.name}</span>

              <span className="text-[9px] font-medium text-emerald-600/70">
                Check out more products from this store
              </span>

              <ArrowRight size={11} />
            </Link>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-3 text-xl font-bold text-emerald-600 sm:text-2xl">
              {formatCurrency(
                product.price,
                product.business.currency || ""
              )}
            </p>

            {product.description && (
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500">
                {product.description}
              </p>
            )}

            {/* Product availability */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
              <span className="rounded-full bg-slate-100 px-2.5 py-1.5">
                {product.stock > 0
                  ? `${product.stock} available`
                  : "Sold out"}
              </span>

              {minimum > 1 && (
                <span className="rounded-full bg-slate-100 px-2.5 py-1.5">
                  Minimum order: {minimum}
                </span>
              )}
            </div>

            {/* Add to cart */}
            {product.stock > 0 && (
              <div className="mt-7 flex flex-wrap gap-3">
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white">
                  <button
                    type="button"
                    disabled={quantity <= minimum}
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(minimum, current - 1)
                      )
                    }
                    className="flex h-full w-10 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="min-w-10 text-center text-sm font-semibold">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    disabled={quantity >= product.stock}
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(product.stock, current + 1)
                      )
                    }
                    className="flex h-full w-10 items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={add}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:flex-none"
                >
                  <ShoppingCart size={15} />
                  {added ? "Added to Cart" : "Add to Cart"}
                </button>
              </div>
            )}

          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                  From this store
                </p>

                <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                  More products from {product.business.name}
                </h2>
              </div>

              <Link
                href={`/store/${product.business.slug}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Visit store
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
{relatedProducts.slice(0, 2).map((relatedProduct) => (
                 <Link
                  key={relatedProduct.id}
                  href={`/marketplace/product/${relatedProduct.id}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    {relatedProduct.image_url ? (
                      <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingCart
                          size={28}
                          className="text-slate-300"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="truncate text-xs font-semibold text-slate-900">
                      {relatedProduct.name}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {formatCurrency(
                        relatedProduct.price,
                        relatedProduct.business.currency || ""
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
