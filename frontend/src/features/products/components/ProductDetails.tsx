"use client";

import { Product } from "../types/product";
import { useState } from "react";
import Toast from "@/src/components/ui/Toast";
import { useCart } from "@/src/features/cart/context/CartContext";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface Props {
  product: Product;
  slug: string;
  currency: string;
  isLocked?: boolean;
}

export default function ProductDetails({
  product,
  slug,
  currency,
  isLocked = false,
}: Props) {
  const {
    addToCart,
    setStoreSlug,
    setCurrency,
  } = useCart();

  const minimumQuantity =
    product.minimum_order_quantity ?? 1;

  const [quantity, setQuantity] = useState(
    minimumQuantity
  );

  const [showToast, setShowToast] = useState(false);

  const canOrder =
    !isLocked &&
    product.stock >= minimumQuantity;

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(minimumQuantity, current - 1)
    );
  }

  function increaseQuantity() {
    setQuantity((current) =>
      Math.min(product.stock, current + 1)
    );
  }

  function handleAddToCart() {
    if (!canOrder) return;

    setStoreSlug(slug);
    setCurrency(currency);

    addToCart(product, quantity);

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {product.name}
        </h1>

        {isLocked && (
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-600">
            This product is currently unavailable.
          </div>
        )}

        <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600 sm:text-4xl">
          {formatCurrency(product.price, currency)}
        </p>

        {minimumQuantity > 1 && (
          <p className="mt-1.5 text-xs text-slate-500">
            Minimum order: {minimumQuantity} units
          </p>
        )}
      </div>

      <div>
        {product.stock > 0 ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            ✓ {product.stock} in stock
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700">
            Out of Stock
          </span>
        )}
      </div>

      {!canOrder && product.stock > 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-2.5 text-xs text-amber-700">
          Only {product.stock} available. The minimum order is{" "}
          {minimumQuantity}.
        </div>
      )}

      {product.description && (
        <div>
          <h2 className="mb-1.5 text-sm font-semibold text-slate-900">
            Description
          </h2>

          <p className="text-xs leading-5 text-slate-600 sm:text-sm">
            {product.description}
          </p>
        </div>
      )}

      {canOrder && (
        <div className="flex flex-col gap-2.5">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-700">
              Quantity
            </p>

            <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= minimumQuantity}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-xl font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>

              <div className="text-center">
                <span className="text-lg font-semibold text-slate-900">
                  {quantity}
                </span>

                {minimumQuantity > 1 && (
                  <p className="text-[10px] text-slate-500">
                    Minimum {minimumQuantity}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-xl font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md active:scale-[0.99]"
          >
            🛒 Add {quantity} to Cart
          </button>
        </div>
      )}

      <Toast
        show={showToast}
        title="Added to Cart"
        message={`${quantity} × ${product.name}`}
        continueHref="/checkout"
      />
    </div>
  );
}
