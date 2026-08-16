"use client";

import { Product } from "@/src/features/products/types/product";
import Button from "@/src/components/ui/Button";
import Link from "next/link";
import { useCart } from "@/src/features/cart/context/CartContext";
import Toast from "@/src/components/ui/Toast";
import { useState } from "react";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface ProductCardProps {
  product: Product;

  mode?: "dashboard" | "store";
  currency: string;

  href?: string;

  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProductCard({
  product,
  mode = "dashboard",
  currency,
  href,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const {
    addToCart,
    setStoreSlug,
    setCurrency,
  } = useCart();
  const [showToast, setShowToast] = useState(false);

  function handleAddToCart() {
    if (!href) return;

    // Assumes href follows a format like "/store/slug-name/..."
    const slug = href.split("/")[2];
    setStoreSlug(slug);
    setCurrency(currency);
    addToCart(product);

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  const card =
    mode === "store" ? (
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
        <div className="aspect-square bg-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="space-y-2 p-3">
          <h2 className="line-clamp-1 text-base font-semibold text-gray-900">
            {product.name}
          </h2>

          {product.description && (
            <p className="line-clamp-1 text-xs text-gray-500">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-emerald-600">
              {formatCurrency(product.price, currency)}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                product.stock > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.stock > 0 ? `${product.stock} left` : "Sold Out"}
            </span>
          </div>

          {product.minimum_order_quantity > 1 && (
            <p className="text-xs font-medium text-gray-500">
              Minimum order: {product.minimum_order_quantity}
            </p>
          )}

          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            className="mt-2 w-full rounded-lg py-2 text-sm"
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? "Add to Cart" : "Sold Out"}
          </Button>
        </div>
      </div>
    ) : (
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
        <div className="aspect-square bg-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="space-y-2 p-4">
          <h2 className="text-lg font-semibold">{product.name}</h2>

          {product.description && (
            <p className="line-clamp-2 text-sm text-gray-500">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-emerald-600">
              {formatCurrency(product.price, currency)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                product.stock > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
            </span>
          </div>

          {mode === "dashboard" ? (
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onEdit}>
                Edit
              </Button>

              <Button variant="danger" className="flex-1" onClick={onDelete}>
                Delete
              </Button>
            </div>
          ) : (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              className="mt-4 w-full"
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
            </Button>
          )}
        </div>
      </div>
    );

  const finalCard = href ? <Link href={href}>{card}</Link> : card;

  return (
    <>
      {finalCard}
      <Toast
        show={showToast}
        title="Added to Cart"
        message={product.name}
        continueHref={href ? `/store/${href.split("/")[2]}` : "/cart"}
      />
    </>
  );
}

