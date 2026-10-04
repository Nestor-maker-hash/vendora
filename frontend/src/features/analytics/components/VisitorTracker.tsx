"use client";

import { useEffect } from "react";

const VISITOR_COOKIE = "vendora:visitor-id";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365;

type VisitorTrackerProps = {
  surface: "storefront" | "marketplace";
  businessId?: string;
};

function getVisitorId() {
  const existing = document.cookie
    .split("; ")
    .find((cookie) =>
      cookie.startsWith(`${VISITOR_COOKIE}=`)
    )
    ?.split("=")[1];

  if (existing) {
    return existing;
  }

  const visitorId = crypto.randomUUID();

  document.cookie = [
    `${VISITOR_COOKIE}=${visitorId}`,
    "path=/",
    `max-age=${VISITOR_MAX_AGE}`,
    "samesite=lax",
  ].join("; ");

  return visitorId;
}

export default function VisitorTracker({
  surface,
  businessId,
}: VisitorTrackerProps) {
  useEffect(() => {
    const visitorId = getVisitorId();

    const dedupeKey = `vendora:analytics:${surface}:${businessId ?? "platform"}:${window.location.pathname}`;

    if (sessionStorage.getItem(dedupeKey)) {
      return;
    }

    sessionStorage.setItem(dedupeKey, "1");

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitorId,
        surface,
        businessId,
        path: window.location.pathname,
      }),
      keepalive: true,
    }).catch(() => {
      sessionStorage.removeItem(dedupeKey);
    });
  }, [surface, businessId]);

  return null;
}
