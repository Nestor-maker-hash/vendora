"use client";

import { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface Props {
  data: {
    date: string;
    revenue: number;
  }[];
  currency: string;
}

function formatDate(value: string) {
  return new Date(
    `${value}T00:00:00Z`
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function RevenueChart({
  data,
  currency,
}: Props) {
  const [range, setRange] =
    useState<"1D" | "7D" | "14D" | "30D" | "ALL">("30D");

  const visibleData = useMemo(() => {
    if (data.length === 0) {
      return [];
    }

    if (range === "ALL") {
      return data;
    }

    const days =
      range === "1D"
        ? 1
        : range === "7D"
          ? 7
          : range === "14D"
            ? 14
            : 30;

    const revenueMap = new Map(
      data.map((item) => [
        item.date,
        item.revenue,
      ])
    );

    const result: {
      date: string;
      revenue: number;
    }[] = [];

    const today = new Date();

    today.setUTCHours(
      0,
      0,
      0,
      0
    );

    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(today);

      day.setUTCDate(
        day.getUTCDate() - i
      );

      const date = day
        .toISOString()
        .split("T")[0];

      result.push({
        date,
        revenue: revenueMap.get(date) ?? 0,
      });
    }

    return result;
  }, [data, range]);

  const totalRevenue = visibleData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const bestDay = visibleData.reduce(
    (best, item) =>
      item.revenue > best.revenue
        ? item
        : best,
    visibleData[0] ?? {
      date: "",
      revenue: 0,
    }
  );

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">
        <div>
          <h2 className="text-base font-semibold sm:text-xl">
            Revenue Trend
          </h2>

          <p className="mt-1 text-[10px] text-gray-500 sm:text-sm">
            Daily revenue from delivered orders.
          </p>
        </div>

        <div className="flex h-48 items-center justify-center text-xs text-gray-500 sm:h-72 sm:text-sm">
          No completed sales to display yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold sm:text-xl">
            Revenue Trend
          </h2>

          <p className="mt-1 text-[10px] text-gray-500 sm:text-sm">
            Daily revenue from delivered orders.
          </p>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border bg-gray-50 p-1 sm:rounded-xl">
          {[
            ["1D", "1 Day"],
            ["7D", "7 Days"],
            ["14D", "14 Days"],
            ["30D", "30 Days"],
            ["ALL", "All"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setRange(
                  value as
                    | "1D"
                    | "7D"
                    | "14D"
                    | "30D"
                    | "ALL"
                )
              }
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition sm:rounded-lg sm:px-3 sm:text-xs ${
                range === value
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 sm:rounded-xl sm:px-4 sm:py-2">
          <p className="text-[9px] font-medium text-emerald-700 sm:text-xs">
            Period Revenue
          </p>

          <p className="mt-0.5 text-xs font-bold text-emerald-700 sm:text-base">
            {formatCurrency(
              totalRevenue,
              currency
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-4">
        <div className="rounded-lg border bg-gray-50 p-2.5 sm:rounded-xl sm:p-4">
          <p className="text-[9px] text-gray-500 sm:text-xs">
            Days tracked
          </p>
          <p className="mt-0.5 text-sm font-semibold sm:text-base">
            {range === "ALL"
              ? visibleData.length
              : `${visibleData.length} ${
                  visibleData.length === 1
                    ? "day"
                    : "days"
                }`}
          </p>
        </div>

        <div className="rounded-lg border bg-gray-50 p-2.5 sm:rounded-xl sm:p-4">
          <p className="text-[9px] text-gray-500 sm:text-xs">
            Best day
          </p>
          <p className="mt-0.5 text-xs font-semibold sm:text-base">
            {bestDay.revenue > 0
              ? `${formatDate(bestDay.date)} · ${formatCurrency(
                  bestDay.revenue,
                  currency
                )}`
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 h-56 overflow-x-auto sm:mt-6 sm:h-80">
        <div
          className="h-full"
          style={{
            minWidth: `${Math.max(
              760,
              visibleData.length * 32
            )}px`,
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={visibleData}
              margin={{
                top: 8,
                right: 16,
                left: 0,
                bottom: 4,
              }}
            >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={18}
            />

            <YAxis
              tickFormatter={(value) =>
                formatCurrency(
                  Number(value),
                  currency
                )
              }
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={58}
            />

            <Tooltip
              labelFormatter={(label) =>
                formatDate(String(label))
              }
              formatter={(value: unknown) => [
                formatCurrency(
                  Number(value),
                  currency
                ),
                "Revenue",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: 12,
              }}
            />

            <Line
              type="linear"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{
                r: 5,
                strokeWidth: 3,
                fill: "#ffffff",
              }}
              activeDot={{
                r: 7,
                strokeWidth: 3,
                fill: "#ffffff",
              }}
            />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
