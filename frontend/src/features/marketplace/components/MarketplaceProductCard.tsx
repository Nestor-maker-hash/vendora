 "use client";

import Link from "next/link";
import { ShoppingCart, Package, Store } from "lucide-react";
import { useState } from "react";
import type { MarketplaceProduct } from "../types/marketplace";
import { useCart } from "@/src/features/cart/context/CartContext";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface Props {
  product: MarketplaceProduct;
}

export default function MarketplaceProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const href = `/marketplace/product/${product.id}`;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    addToCart(product);
    setAdded(true);

    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={34} className="text-slate-300" />
          </div>
        )}

        <div className="absolute left-2.5 top-2.5">
          <span className="rounded-full bg-white/90 px-2 py-1 text-[8px] font-semibold text-emerald-700 shadow-sm backdrop-blur">
            {product.stock > 0 ? `${product.stock} left` : "Sold out"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock <= 0}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:scale-105 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart size={15} />
        </button>

        {added && (
          <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/90 px-2.5 py-1 text-[8px] font-semibold text-white">
            Added
          </span>
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
          <Store size={10} />
          <span className="truncate">{product.business.name}</span>
        </div>

        <h3 className="mt-1 truncate text-sm font-semibold tracking-tight text-slate-900">
          {product.name}
        </h3>

        {product.description && (
          <p className="mt-1 line-clamp-2 text-[9px] leading-3.5 text-slate-500">
            {product.description}
          </p>
        )}

        <div className="mt-2.5 flex items-end justify-between gap-2">
          <span className="text-sm font-bold tracking-tight text-slate-950 sm:text-base">
            {formatCurrency(product.price, product.business.currency || "")}
          </span>

          {product.minimum_order_quantity > 1 && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium text-slate-500">
              Min. {product.minimum_order_quantity}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
