const currencySymbols: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GHS: "GH₵",
  KES: "KSh",
};

export function formatSubscriptionPrice(
  canonicalPrice: number,
  currency: string,
  exchangeRate: number
): string {
  if (canonicalPrice === 0) {
    return "Free";
  }

  const normalizedCurrency =
    currency.toUpperCase();

  const symbol =
    currencySymbols[normalizedCurrency] ??
    normalizedCurrency;

  const convertedPrice =
    canonicalPrice * exchangeRate;

  return `${symbol}${Number(
    convertedPrice.toFixed(2)
  ).toLocaleString()}`;
}
