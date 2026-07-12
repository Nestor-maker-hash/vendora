"use client";

import Link from "next/link";
import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import { useProducts } from "@/src/features/products/hooks/useProducts";

export default function ProductsPage() {
  const { products, loading, error } = useProducts();

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
            <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">
              <table className="min-w-full">
                <thead>
                <tr className="border-b">
		  <th className="p-4 text-left">Image</th>
		  <th className="p-4 text-left">Name</th>
		  <th className="p-4 text-left">Price</th>
		  <th className="p-4 text-left">Stock</th>
		  <th className="p-4 text-left">Actions</th>
		</tr>
                </thead>

                <tbody>
                  {products.map((product) => (
		<tr key={product.id} className="border-b">
  <td className="p-4">
    {product.image_url ? (
      <img
        src={product.image_url}
        alt={product.name}
        className="h-16 w-16 rounded-lg object-cover"
      />
    ) : (
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500">
        No Image
      </div>
    )}
  </td>

  <td className="p-4">{product.name}</td>
  <td className="p-4">₦{product.price}</td>
  <td className="p-4">{product.stock}</td>

  <td className="p-4">
    <button className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200">
      Edit
    </button>
  </td>
</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

