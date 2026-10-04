"use client";

import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardVisitorIndicator() {
  const [visitors, setVisitors] =
    useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVisitors() {
      try {
        const response = await fetch(
          "/api/analytics/visitors",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load visitor analytics."
          );
        }

        const data = (await response.json()) as {
          visitors?: unknown;
        };

        if (
          !cancelled &&
          typeof data.visitors === "number"
        ) {
          setVisitors(data.visitors);
        }
      } catch (error) {
        console.error(
          "Dashboard visitor indicator error:",
          error
        );

        if (!cancelled) {
          setVisitors(null);
        }
      }
    }

    loadVisitors();

    return () => {
      cancelled = true;
    };
  }, []);

  if (visitors === null) {
    return null;
  }

  return (
    <Link
      href="/analytics"
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
    >
      <Eye className="h-3.5 w-3.5" />
      <span>{visitors.toLocaleString()} visitors</span>
      <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
    </Link>
  );
}
