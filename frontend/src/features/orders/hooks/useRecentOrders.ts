"use client";

import { useEffect, useState } from "react";
import { getRecentOrders } from "../services/getRecentOrders";
import { Order } from "../types/order";

export function useRecentOrders(limit = 5) {
  const [orders, setOrders] = useState<
  (Order & {
    business: {
      currency: string;
    };
  })[]
>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getRecentOrders(limit);
        setOrders(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [limit]);

  return {
    orders,
    loading,
  };
}
