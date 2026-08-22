import "server-only";

import { supabaseServer } from "@/src/lib/supabaseServer";

const BASE_CURRENCY = "NGN";

export const SUPPORTED_CURRENCIES = [
  "NGN",
  "USD",
  "GHS",
  "KES",
] as const;

export type SupportedCurrency =
  (typeof SUPPORTED_CURRENCIES)[number];

interface ExchangeRate {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  source: string;
  fetchedAt: string;
  expiresAt: string;
}

export async function getExchangeRate(
  quoteCurrency: string
): Promise<ExchangeRate> {
  const normalizedCurrency =
    quoteCurrency.toUpperCase();

  if (
    !SUPPORTED_CURRENCIES.includes(
      normalizedCurrency as SupportedCurrency
    )
  ) {
    throw new Error(
      `Unsupported currency: ${normalizedCurrency}`
    );
  }

  if (normalizedCurrency === BASE_CURRENCY) {
    const now = new Date().toISOString();

    return {
      baseCurrency: BASE_CURRENCY,
      quoteCurrency: BASE_CURRENCY,
      rate: 1,
      source: "canonical",
      fetchedAt: now,
      expiresAt: now,
    };
  }

  const { data, error } =
    await supabaseServer
      .from("currency_exchange_rates")
      .select(`
        base_currency,
        quote_currency,
        rate,
        source,
        fetched_at,
        expires_at
      `)
      .eq("base_currency", BASE_CURRENCY)
      .eq("quote_currency", normalizedCurrency)
      .single();

  if (error || !data) {
    throw new Error(
      `Exchange rate for ${BASE_CURRENCY}/${normalizedCurrency} is unavailable.`
    );
  }

  const expiresAt =
    new Date(data.expires_at);

  if (
    !Number.isFinite(
      expiresAt.getTime()
    ) ||
    expiresAt <= new Date()
  ) {
    throw new Error(
      `Exchange rate for ${BASE_CURRENCY}/${normalizedCurrency} has expired.`
    );
  }

  const rate = Number(data.rate);

  if (
    !Number.isFinite(rate) ||
    rate <= 0
  ) {
    throw new Error(
      `Invalid exchange rate for ${BASE_CURRENCY}/${normalizedCurrency}.`
    );
  }

  return {
    baseCurrency:
      data.base_currency,
    quoteCurrency:
      data.quote_currency,
    rate,
    source: data.source,
    fetchedAt:
      data.fetched_at,
    expiresAt:
      data.expires_at,
  };
}
