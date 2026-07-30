"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import ProductForm from "@/src/features/products/components/ProductForm";
import { getProductById } from "@/src/features/products/services/getProductById";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-6 text-3xl font-bold">
            Edit Product
          </h1>

          {loading ? (
            <p>Loading...</p>
          ) : product ? (
            <ProductForm
              productId={product.id}
              initialValues={product}
            />
          ) : (
            <p className="text-red-500">
              Product not found.
            </p>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
