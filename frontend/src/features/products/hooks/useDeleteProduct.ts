"use client";

import { useState } from "react";
import { deleteProduct } from "../services/deleteProduct";

export function useDeleteProduct() {
  const [loading, setLoading] = useState(false);

  async function removeProduct(id: string) {
    setLoading(true);

    try {
      await deleteProduct(id);
    } finally {
      setLoading(false);
    }
  }

  return {
    removeProduct,
    loading,
  };
}
