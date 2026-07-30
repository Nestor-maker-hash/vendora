"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "../services/getAnalytics";
import { getTopProducts } from "../services/getTopProducts";

export function useAnalytics() {
const [analytics, setAnalytics] = useState({
  revenue: 0,
  orders: 0,
  customers: 0,
  products: 0,
  completedOrders: 0,
  pendingOrders: 0,
  averageOrderValue: 0,
  lowStockProducts: 0,
  revenueHistory: [] as {
  date: string;
  revenue: number;
}[],
  topProducts: [] as {
    name: string;
    quantity: number;
    revenue: number;
  }[],
});


  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summary, topProducts] = await Promise.all([
  getAnalytics(),
  getTopProducts(),
]);

setAnalytics({
  ...summary,
  topProducts,
});
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    analytics,
    loading,
  };
}
