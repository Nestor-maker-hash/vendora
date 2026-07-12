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
