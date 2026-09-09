"use client";

import { useState } from "react";
import { createProduct } from "../services/createProduct";

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);

  async function addProduct(input: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  minimum_order_quantity?: number;
  image_url?: string;
}) {
    setLoading(true);

    try {
      const product = await createProduct(input);
      return product;
    } finally {
      setLoading(false);
    }
  }

  return {
    addProduct,
    loading,
  };
}
