"use client";

import Button from "@/src/components/ui/Button";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    stock: number;
    image_url?: string | null;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
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
        <h2 className="text-lg font-semibold">
          {product.name}
        </h2>

        {product.description && (
          <p className="line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-600">
            ₦{product.price.toLocaleString()}
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

        <div className="mt-4 flex gap-2">
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
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
