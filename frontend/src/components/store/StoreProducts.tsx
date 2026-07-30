"use client";

import { useMemo } from "react";
import ProductCard from "@/src/features/products/components/ProductCard";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
 
}

interface Props {
  slug: string;
  products: Product[];
  search: string;
  currency: string;
}

export default function StoreProducts({
  slug,
  products,
  search,
  currency,
}: Props) {

  const filteredProducts = useMemo(() => {
const q = (search ?? "").toLowerCase().trim();

    if (!q) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q)
      );
    });
  }, [products, search]);

  return (
    <>



      {filteredProducts.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">
            No products found
          </h2>

          <p className="mt-2 text-gray-500">
            Try another search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              mode="store"
	      currency={currency}
              href={`/store/${slug}/product/${product.id}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
