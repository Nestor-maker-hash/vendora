export interface BusinessLocationParts {
  address?: string | null;
  city?: string | null;
  state?: string | null;
}

export function formatBusinessLocation({
  address,
  city,
  state,
}: BusinessLocationParts): string {
  return [address, city, state]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}
