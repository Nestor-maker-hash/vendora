export type PWAContext = "marketplace" | "business";

const PWA_CONTEXT_COOKIE = "vendora:last-context";

export function setPWAContext(
  context: PWAContext
): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = [
    `${PWA_CONTEXT_COOKIE}=${context}`,
    "path=/",
    "max-age=31536000",
    "samesite=lax",
  ].join("; ");
}

export function getPWAContext(): PWAContext {
  if (typeof document === "undefined") {
    return "marketplace";
  }

  const cookie = document.cookie
    .split("; ")
    .find((value) =>
      value.startsWith(`${PWA_CONTEXT_COOKIE}=`)
    );

  const value = cookie?.split("=")[1];

  return value === "business"
    ? "business"
    : "marketplace";
}
