"use client";

import {
  ArrowRight,
  Heart,
  Search,
  ShoppingBag,
  Plus,
} from "lucide-react";
import { useState } from "react";

const products = [
  {
    name: "Classic Sneakers",
    price: "₦45,000",
  },
  {
    name: "Premium T-Shirt",
    price: "₦18,500",
  },
  {
    name: "Leather Handbag",
    price: "₦32,000",
  },
];

export default function StorefrontPreview() {
  const [cartCount, setCartCount] = useState(2);

  function addToCart() {
    setCartCount((count) => count + 1);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Store navbar */}
      <div className="flex h-12 items-center justify-between border-b border-gray-100 px-4 sm:px-6">
        <div>
          <p className="text-sm font-extrabold tracking-tight text-gray-900">
            Xclusive Fashion
          </p>

          <p className="text-[8px] text-gray-400">
            Quality fashion, delivered.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Search size={14} className="text-gray-400" />

          <Heart size={14} className="text-gray-400" />

          <div className="relative">
            <ShoppingBag size={15} className="text-gray-700" />

            <span className="absolute -right-2 -top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[7px] font-bold text-white">
              {cartCount}
            </span>
          </div>
        </div>
      </div>

      {/* Store hero */}
      <div className="bg-gray-50 px-5 py-10 text-center sm:px-10">
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
          Welcome to our store
        </span>

        <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Fashion made simple.
        </h3>

        <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-gray-500 sm:text-xs">
          Discover our latest collection and shop directly
          from our online store.
        </p>

        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-[10px] font-semibold text-white"
        >
          Shop Collection
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Products */}
      <div className="px-4 py-5 sm:px-6 sm:py-7">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              Featured Products
            </h4>

            <p className="mt-0.5 text-[9px] text-gray-400">
              Our latest products
            </p>
          </div>

          <span className="text-[9px] font-medium text-emerald-600">
            View all →
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
          {products.map((product, index) => (
            <div key={product.name}>
              {/* Product image */}
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <div
                  className={`absolute inset-0 ${
                    index === 0
                      ? "bg-gradient-to-br from-gray-200 to-gray-300"
                      : index === 1
                      ? "bg-gradient-to-br from-emerald-50 to-emerald-100"
                      : "bg-gradient-to-br from-amber-50 to-orange-100"
                  }`}
                />

                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-gray-400">
                  Product image
                </div>
              </div>

              {/* Product information */}
              <p className="mt-2 truncate text-[9px] font-semibold text-gray-800 sm:text-[10px]">
                {product.name}
              </p>

              <p className="mt-0.5 text-[9px] font-bold text-emerald-600">
                {product.price}
              </p>

              {/* Add to cart */}
              <button
                type="button"
                onClick={addToCart}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-md bg-gray-900 px-2 py-2 text-[8px] font-semibold text-white transition hover:bg-emerald-600 sm:text-[9px]"
              >
                <Plus size={10} />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Store footer */}
      <div className="border-t border-gray-100 px-4 py-3 text-center">
        <p className="text-[8px] text-gray-400">
          Powered by{" "}
          <span className="font-semibold text-gray-600">
            Vendora
          </span>
        </p>
      </div>
    </div>
  );
}
