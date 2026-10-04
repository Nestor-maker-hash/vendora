"use client";

import { Eye, Users, TrendingDown, TrendingUp } from "lucide-react";

type StorefrontVisitorsProps = {
  visitors: number;
  visits: number;
  weeklyAverage: number;
  previousWeeklyAverage: number;
};

export default function StorefrontVisitors({
  visitors,
  visits,
  weeklyAverage,
  previousWeeklyAverage,
}: StorefrontVisitorsProps) {
  const hasPreviousData = previousWeeklyAverage > 0;

  const change = hasPreviousData
    ? ((weeklyAverage - previousWeeklyAverage) /
        previousWeeklyAverage) *
      100
    : 0;

  const roundedChange = Math.round(Math.abs(change) * 10) / 10;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
            Storefront Visitors
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Visitors to your storefront over the last 4 weeks.
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Eye className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Users className="h-4 w-4" />
            Unique visitors
          </div>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {visitors.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Eye className="h-4 w-4" />
            Total visits
          </div>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {visits.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs font-medium text-slate-500">
            Weekly average
          </div>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {weeklyAverage.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}
          </p>

          {hasPreviousData ? (
            <div
              className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                isPositive
                  ? "text-emerald-600"
                  : isNegative
                    ? "text-red-600"
                    : "text-slate-500"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : isNegative ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : null}

              {roundedChange === 0
                ? "No change"
                : `${roundedChange}% vs previous 4 weeks`}
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-400">
              No previous data
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
