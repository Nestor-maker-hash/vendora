"use client";

import { useEffect, useState } from "react";

interface ExchangeRateResult {
  rate: number;
  loading: boolean;
  error: string | null;
}

export function useExchangeRate(
  currency?: string | null
): ExchangeRateResult {
  const normalizedCurrency =
    currency?.toUpperCase() ?? "NGN";

  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(
    normalizedCurrency !== "NGN"
  );
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRate() {
      if (normalizedCurrency === "NGN") {
        setRate(1);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/currency/rates?currency=${encodeURIComponent(
            normalizedCurrency
          )}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ??
              "Failed to load exchange rate."
          );
        }

        if (!cancelled) {
          setRate(Number(result.rate));
        }
      } catch (error) {
        if (!cancelled) {
          setRate(1);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load exchange rate."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRate();

    return () => {
      cancelled = true;
    };
  }, [normalizedCurrency]);

  return {
    rate,
    loading,
    error,
  };
}
