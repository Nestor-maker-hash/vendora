import "server-only";

import {
  getExchangeRate,
  type SupportedCurrency,
} from "./getExchangeRate.server";

interface ConvertedAmount {
  canonicalAmount: number;
  canonicalCurrency: "NGN";
  amount: number;
  currency: SupportedCurrency;
  exchangeRate: number;
  rateSource: string;
  rateFetchedAt: string;
  rateExpiresAt: string;
}

export async function convertFromNgn(
  canonicalAmount: number,
  currency: SupportedCurrency
): Promise<ConvertedAmount> {
  if (
    !Number.isFinite(canonicalAmount) ||
    canonicalAmount < 0
  ) {
    throw new Error(
      "Canonical amount must be a valid non-negative number."
    );
  }

  const exchangeRate =
    await getExchangeRate(currency);

  const convertedAmount =
    canonicalAmount *
    exchangeRate.rate;

  if (
    !Number.isFinite(convertedAmount) ||
    convertedAmount < 0
  ) {
    throw new Error(
      "Currency conversion produced an invalid amount."
    );
  }

  return {
    canonicalAmount,
    canonicalCurrency: "NGN",
    amount:
      currency === "NGN"
        ? canonicalAmount
        : Number(
            convertedAmount.toFixed(2)
          ),
    currency,
    exchangeRate:
      exchangeRate.rate,
    rateSource:
      exchangeRate.source,
    rateFetchedAt:
      exchangeRate.fetchedAt,
    rateExpiresAt:
      exchangeRate.expiresAt,
  };
}
