const currencySymbols: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GHS: "GH₵",
  KES: "KSh",
  ZAR: "R",
  GBP: "£",
  EUR: "€",
};

export function formatCurrency(
  value: number,
  currency: string = "NGN"
): string {
  const symbol =
    currencySymbols[currency] ?? currency;

  const format = (number: number) =>
    Number(number.toFixed(2)).toString();

  if (value >= 1_000_000_000) {
    return `${symbol}${format(value / 1_000_000_000)}B`;
  }

  if (value >= 1_000_000) {
    return `${symbol}${format(value / 1_000_000)}M`;
  }

  if (value >= 1_000) {
    return `${symbol}${format(value / 1_000)}K`;
  }

  return `${symbol}${value.toLocaleString()}`;
}
