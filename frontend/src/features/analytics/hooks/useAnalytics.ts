"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "../services/getAnalytics";
import { getTopProducts } from "../services/getTopProducts";

const initialAnalytics = {
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
};

export function useAnalytics() {
  const [analytics, setAnalytics] =
    useState(initialAnalytics);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [summary, topProducts] =
          await Promise.all([
            getAnalytics(),
            getTopProducts(),
          ]);

        if (!active) return;

        setAnalytics({
          ...summary,
          topProducts,
        });
      } catch (err) {
        console.error(
          "Analytics loading error:",
          err
        );

        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load analytics."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return {
    analytics,
    loading,
    error,
  };
}
