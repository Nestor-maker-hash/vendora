"use client";

import { Product } from "@/src/features/products/types/product";
import Button from "@/src/components/ui/Button";
import Link from "next/link";
import { useCart } from "@/src/features/cart/context/CartContext";
import Toast from "@/src/components/ui/Toast";
import { useState } from "react";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface ProductCardProps {
  product: Product & {
    locked?: boolean;
  };

  mode?: "dashboard" | "store";
  currency: string;
  href?: string;

  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;

  isLocked?: boolean;
}

export default function ProductCard({
  product,
  mode = "dashboard",
  currency,
  href,
  onEdit,
  onDelete,
  deleting = false,
  isLocked = false,
}: ProductCardProps) {
  const {
    addToCart,
    setStoreSlug,
    setCurrency,
  } = useCart();

  const [showToast, setShowToast] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const hasLongDescription =
    Boolean(product.description && product.description.length > 90);

  function handleAddToCart() {
    if (!href || isLocked) return;

    const slug = href.split("/")[2];

    setStoreSlug(slug);
    setCurrency(currency);
    addToCart(product);

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }

  const storeCard = (
    <div
      className={`group relative overflow-hidden rounded-[1.15rem] border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-all duration-300 ${
        isLocked
          ? "opacity-55 grayscale"
          : "hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_10px_25px_rgba(15,23,42,0.10)]"
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/35 backdrop-blur-[1px]">
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[9px] font-semibold text-white shadow-md">
            Unavailable
          </span>
        </div>
      )}

      {/* Compact product image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
              📦
            </span>

            <span className="text-[9px] font-medium">
              No image
            </span>
          </div>
        )}

        {/* Stock badge */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute right-2 top-2">
          <span
            className={`rounded-full border px-1.5 py-0.5 text-[8px] font-medium shadow-sm backdrop-blur-md ${
              product.stock > 0
                ? "border-white/70 bg-white/85 text-emerald-700"
                : "border-white/60 bg-white/90 text-red-600"
            }`}
          >
            {product.stock > 0
              ? `${product.stock} left`
              : "Sold out"}
          </span>
        </div>
      </div>

      {/* Compact information */}
      <div className="p-2.5 sm:p-3">
        <h2 className="line-clamp-1 text-xs font-semibold tracking-tight text-slate-900 sm:text-sm">
          {product.name}
        </h2>

        {product.description ? (
          <div className="mt-1">
            <p
              className={`text-[9px] leading-3.5 text-slate-500 sm:text-[10px] ${
                descriptionExpanded ? "" : "line-clamp-2"
              }`}
            >
              {product.description}
            </p>

            {hasLongDescription && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setDescriptionExpanded(
                    (current) => !current
                  );
                }}
                className="mt-0.5 text-[9px] font-semibold text-emerald-600 hover:text-emerald-700"
              >
                {descriptionExpanded ? "Less" : "More"}
              </button>
            )}
          </div>
        ) : (
          <p className="mt-1 text-[9px] text-slate-400">
            Quality product
          </p>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold tracking-tight text-slate-950 sm:text-base">
            {formatCurrency(product.price, currency)}
          </span>

          {product.minimum_order_quantity > 1 && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium text-slate-500">
              Min. {product.minimum_order_quantity}
            </span>
          )}
        </div>

        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart();
          }}
          className="mt-2 w-full rounded-lg py-1.5 text-[10px] font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          disabled={product.stock === 0 || isLocked}
        >
          {isLocked
            ? "Unavailable"
            : product.stock > 0
            ? "Add to Cart"
            : "Sold Out"}
        </Button>
      </div>
    </div>
  );

  const dashboardCard = (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md sm:rounded-2xl">
      <div className="aspect-[4/3] bg-gray-100 sm:aspect-square">
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

      <div className="space-y-1.5 p-3 sm:space-y-2 sm:p-4">
        <h2 className="text-base font-semibold sm:text-lg">
          {product.name}
        </h2>

        {product.description && (
          <p className="line-clamp-2 text-xs text-gray-500 sm:text-sm">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-600 sm:text-xl">
            {formatCurrency(product.price, currency)}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              product.stock > 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {product.stock > 0
              ? `${product.stock} in stock`
              : "Out of Stock"}
          </span>
        </div>

        {mode === "dashboard" ? (
          <div className="mt-3 flex gap-2 sm:mt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onEdit}
            >
              Edit
            </Button>

            <Button
              variant="danger"
              className="flex-1"
              onClick={onDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
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
            {product.stock > 0
              ? "Add to Cart"
              : "Out of Stock"}
          </Button>
        )}
      </div>
    </div>
  );

  const card = mode === "store" ? storeCard : dashboardCard;

  const finalCard =
    href && !isLocked ? (
      <Link href={href}>{card}</Link>
    ) : (
      card
    );

  return (
    <>
      {finalCard}

      <Toast
        show={showToast}
        title="Added to Cart"
        message={product.name}
        continueHref="/checkout"
      />
    </>
  );
}
