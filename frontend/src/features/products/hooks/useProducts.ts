"use client";

import { useEffect, useState, useCallback } from "react";
import { Product } from "../types/product";
import { getProducts } from "../services/getProducts";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    products,
    loading,
    error,
    refetch,
    setProducts, // We'll use this later for optimistic updates
  };
}
