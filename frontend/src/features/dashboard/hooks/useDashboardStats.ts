"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/getDashboardStats";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { stats, loading };
}
