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
}

export default function ProductDetails({
  product,
  slug,
  currency,
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
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          {product.name}
        </h1>

        <p className="mt-3 text-4xl font-bold text-emerald-600">
          {formatCurrency(product.price, currency)}
        </p>

        {minimumQuantity > 1 && (
          <p className="mt-2 text-sm text-gray-500">
            Minimum order: {minimumQuantity} units
          </p>
        )}
      </div>

      <div>
        {product.stock > 0 ? (
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            ✓ {product.stock} in stock
          </span>
        ) : (
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
            Out of Stock
          </span>
        )}
      </div>

      {!canOrder && product.stock > 0 && (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          Only {product.stock} available. The minimum order is{" "}
          {minimumQuantity}.
        </div>
      )}

      {product.description && (
        <div>
          <h2 className="mb-2 text-base font-semibold text-gray-900">
            Description
          </h2>

          <p className="text-sm leading-6 text-gray-600">
            {product.description}
          </p>
        </div>
      )}

      {canOrder && (
        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              Quantity
            </p>

            <div className="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= minimumQuantity}
                className="flex h-10 w-10 items-center justify-center rounded-lg border text-2xl font-bold transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>

              <div className="text-center">
                <span className="text-xl font-semibold">
                  {quantity}
                </span>

                {minimumQuantity > 1 && (
                  <p className="text-xs text-gray-500">
                    Minimum {minimumQuantity}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                className="flex h-10 w-10 items-center justify-center rounded-lg border text-2xl font-bold transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-xl bg-emerald-600 py-3.5 text-base font-medium text-white transition hover:bg-emerald-700"
          >
            🛒 Add {quantity} to Cart
          </button>
        </div>
      )}

      <Toast
        show={showToast}
        title="Added to Cart"
        message={`${quantity} × ${product.name}`}
        continueHref={`/store/${slug}`}
      />
    </div>
  );
}
