import "server-only";

import { supabaseServer } from "@/src/lib/supabaseServer";

const BASE_CURRENCY = "NGN";

const QUOTE_CURRENCIES = [
  "USD",
  "GHS",
  "KES",
] as const;

const RATE_TTL_HOURS = 48;

interface FrankfurterRate {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

export async function syncExchangeRates() {
  const quotes =
    QUOTE_CURRENCIES.join(",");

  const response = await fetch(
    `https://api.frankfurter.dev/v2/rates?base=${BASE_CURRENCY}&quotes=${quotes}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch exchange rates: ${response.status}`
    );
  }

  const result =
    (await response.json()) as FrankfurterRate[];

  if (!Array.isArray(result)) {
    throw new Error(
      "Exchange rate provider returned an invalid response."
    );
  }

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() +
      RATE_TTL_HOURS * 60 * 60 * 1000
  ).toISOString();

  const rows = QUOTE_CURRENCIES.map(
    (quoteCurrency) => {
      const providerRate =
        result.find(
          (item) =>
            item.base === BASE_CURRENCY &&
            item.quote === quoteCurrency
        );

      if (
        !providerRate ||
        !Number.isFinite(
          Number(providerRate.rate)
        ) ||
        Number(providerRate.rate) <= 0
      ) {
        throw new Error(
          `Invalid or missing ${BASE_CURRENCY}/${quoteCurrency} exchange rate.`
        );
      }

      return {
        base_currency: BASE_CURRENCY,
        quote_currency: quoteCurrency,
        rate: Number(providerRate.rate),
        source: "frankfurter",
        fetched_at: now.toISOString(),
        expires_at: expiresAt,
        updated_at: now.toISOString(),
      };
    }
  );

  const { data, error } =
    await supabaseServer
      .from("currency_exchange_rates")
      .upsert(rows, {
        onConflict:
          "base_currency,quote_currency",
      })
      .select(`
        base_currency,
        quote_currency,
        rate,
        source,
        fetched_at,
        expires_at
      `);

  if (error) {
    throw new Error(
      `Failed to store exchange rates: ${error.message}`
    );
  }

  return data;
}
