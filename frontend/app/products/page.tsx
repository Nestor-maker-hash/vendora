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
  const { removeProduct } = useDeleteProduct();
const { currency } = useBusiness();

async function handleDelete(id: string) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) return;

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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Products</h1>
            <Link
              href="/products/new"
              className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
            >
              + Add Product
            </Link>
          </div>

          {loading && <p className="mt-6">Loading products...</p>}

          {error && <p className="mt-6 text-red-500">{error}</p>}

          {/* Step 2: Improved Empty State */}
          {!loading && products.length === 0 && (
            <div className="mt-12 rounded-xl border-2 border-dashed p-12 text-center">
              <h2 className="text-2xl font-semibold">No products yet</h2>
              <p className="mt-3 text-gray-500">
                Create your first product and start selling online.
              </p>
              <Link
                href="/products/new"
                className="mt-6 inline-block rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
              >
                Create First Product
              </Link>
            </div>
          )}
{!loading && products.length > 0 && (
  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {products.map((product) => (
      <ProductCard
  key={product.id}
  product={product}
  currency={currency}
  onEdit={() => router.push(`/products/${product.id}/edit`)}
  onDelete={() => handleDelete(product.id)}
/>
    ))}
  </div>
)}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

