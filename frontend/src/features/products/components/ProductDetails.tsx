"use client";

import { Product } from "../types/product";
import { useState } from "react";
import Toast from "@/src/components/ui/Toast";
import { useCart } from "@/src/features/cart/context/CartContext";
import Link from "next/link";
import { formatCurrency } from "@/src/utils/formatCurrency";


interface Props {
  product: Product;
  slug: string;
  currency: string;

}

export default function ProductDetails({ product,slug,currency, }: Props) {
const {
  items,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  setStoreSlug,
  setCurrency,
} = useCart();

 const [showToast, setShowToast] = useState(false);


const cartItem = items.find(
  (item) => item.id === product.id
);

function handleAddToCart() {
  // Remember which store the customer is shopping in
  setStoreSlug(slug);
  setCurrency(currency);

  addToCart(product);

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

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
{cartItem ? (
  <div className="flex flex-1 items-center justify-between rounded-xl bg-emerald-600 px-4 py-3 text-white">

    <button
      onClick={() => decreaseQuantity(product.id)}
      className="text-2xl font-bold"
    >
      −
    </button>

    <span className="text-lg font-semibold">
      {cartItem.quantity}
    </span>

    <button
      onClick={() => {
        if (cartItem.quantity < product.stock) {
          increaseQuantity(product.id);
        }
      }}
      className="text-2xl font-bold"
    >
      +
    </button>

  </div>
) : (
  <button
    onClick={handleAddToCart}
    disabled={product.stock === 0}
    className="flex-1 rounded-xl bg-emerald-600 py-3.5 text-base font-medium text-white transition hover:bg-emerald-700 disabled:bg-gray-400"
  >
    🛒 Add to Cart
  </button>
)}
        <button
          disabled={product.stock === 0}
          className="flex-1 rounded-xl border border-gray-300 bg-white py-3.5 text-base font-medium text-gray-900 transition hover:bg-gray-50"
        >
          ⚡ Buy Now
        </button>
      </div>

      <Link
        href="/cart"
        className="text-center text-sm font-medium text-emerald-600 hover:underline"
      >
        View Cart →
      </Link>
<Toast
  show={showToast}
  title="Added to Cart"
  message={product.name}
  continueHref={`/store/${slug}`}
/>
    </div>
  );
}

