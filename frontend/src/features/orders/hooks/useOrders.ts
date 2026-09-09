"use client";

import { useCallback, useEffect, useState } from "react";
import { getOrders } from "../services/getOrders";
import { Order } from "../types/order";

const PAGE_SIZE = 20;

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] =
    useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getOrders(
        PAGE_SIZE,
        0
      );

      setOrders(result.orders);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load orders:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      const result = await getOrders(
        PAGE_SIZE,
        orders.length
      );

      setOrders((currentOrders) => [
        ...currentOrders,
        ...result.orders,
      ]);

      setHasMore(result.hasMore);
    } catch (error) {
      console.error(
        "Failed to load more orders:",
        error
      );
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, orders.length]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    retry: loadOrders,
  };
}
