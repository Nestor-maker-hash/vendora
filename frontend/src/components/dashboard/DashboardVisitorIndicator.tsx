"use client";

import Link from "next/link";
import { Eye, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import { getVisitorAnalytics } from "@/src/features/analytics/services/getVisitorAnalytics";

export default function DashboardVisitorIndicator() {
  const { business, loading: businessLoading } = useBusiness();
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    if (businessLoading || !business?.id) {
      return;
    }

    let cancelled = false;

    const businessId = business.id;

    async function loadVisitors() {
      try {
        const data = await getVisitorAnalytics(businessId);

        if (!cancelled) {
          setVisitors(data.visitors);
        }
      } catch {
        if (!cancelled) {
          setVisitors(null);
        }
      }
    }

    loadVisitors();

    return () => {
      cancelled = true;
    };
  }, [business?.id, businessLoading]);

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
