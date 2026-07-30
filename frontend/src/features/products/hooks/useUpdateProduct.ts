"use client";

import { useState } from "react";
import { updateProduct } from "../services/updateProduct";

export function useUpdateProduct() {
  const [loading, setLoading] = useState(false);

  async function editProduct(
    id: string,
    product: {
      name: string;
      description: string;
      price: number;
      stock: number;
      image_url?: string | null;
    }
  ) {
    setLoading(true);

    try {
      await updateProduct(id, product);
    } finally {
      setLoading(false);
    }
  }

  return {
    editProduct,
    loading,
  };
}
