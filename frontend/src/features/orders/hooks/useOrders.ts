"use client";

import { useEffect, useState } from "react";
import { getOrders } from "../services/getOrders";
import { Order } from "../types/order";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    orders,
    loading,
  };
}
