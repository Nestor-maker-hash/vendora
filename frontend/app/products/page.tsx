"use client";

import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import { useProducts } from "@/src/features/products/hooks/useProducts";
import ProductCard from "@/src/features/products/components/ProductCard";
import { useRouter } from "next/navigation";
import { useDeleteProduct } from "@/src/features/products/hooks/useDeleteProduct";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

export default function ProductsPage() {
 const { products, loading, error, setProducts } = useProducts();

  const router = useRouter();
  const {
  removeProduct,
  loading: deleting,
} = useDeleteProduct();
const { currency } = useBusiness();

async function handleDelete(id: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed || deleting) return;

  // Save current list in case we need to restore it
  const previousProducts = [...products];

  // Remove immediately from the UI
  setProducts((current) =>
    current.filter((product) => product.id !== id)
  );

  try {
    await removeProduct(id);
  } catch (error) {
    // Restore the previous list if deletion fails
    setProducts(previousProducts);

    console.error(error);
    alert("Failed to delete product.");
  }
}

  return (
    <AuthGuard>
      <DashboardLayout>
        <div>
          {/* Step 1: Improved Header Section with Add Product Action */}
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h1 className="text-2xl font-bold sm:text-3xl">Products</h1>
            <Link
              href="/products/new"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-5 sm:py-3 sm:text-base"
            >
              + Add Product
            </Link>
          </div>

{loading && (
  <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div className="aspect-square animate-pulse bg-gray-200" />

        <div className="space-y-3 p-4">
          <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />

          <div className="flex items-center justify-between pt-2">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
          </div>

          <div className="flex gap-2 pt-2">
            <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    ))}
  </div>
)}

          {error && <p className="mt-6 text-red-500">{error}</p>}

          {/* Step 2: Improved Empty State */}
          {!loading && products.length === 0 && (
            <div className="mt-8 rounded-xl border-2 border-dashed p-6 text-center sm:mt-12 sm:p-12">
              <h2 className="text-xl font-semibold sm:text-2xl">No products yet</h2>
              <p className="mt-2 text-sm text-gray-500 sm:mt-3">
                Create your first product and start selling online.
              </p>
              <Link
                href="/products/new"
                className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2.5 text-sm text-white hover:bg-emerald-700 sm:mt-6 sm:px-6 sm:py-3 sm:text-base"
              >
                Create First Product
              </Link>
            </div>
          )}
{!loading && products.length > 0 && (
  <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
    {products.map((product) => (
      <ProductCard
  key={product.id}
  product={product}
  currency={currency}
  onEdit={() => router.push(`/products/${product.id}/edit`)}
  onDelete={() => handleDelete(product.id)}
  deleting={deleting}
/>
    ))}
  </div>
)}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

