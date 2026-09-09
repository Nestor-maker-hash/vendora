"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Order } from "@/src/features/orders/types/order";

interface Props {
  orders: Order[];
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export default function OrdersList({
  orders,
  hasMore,
  loadingMore,
  onLoadMore,
}: Props) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customer_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.customer_phone.includes(search) ||
        order.id
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        order.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, status]);

  return (
    <>
      {/* Search and filters */}
      <div className="mb-5 flex min-w-0 flex-col gap-2.5 rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:mb-8 sm:gap-4 sm:rounded-2xl sm:p-4 md:flex-row md:items-center">
        <div className="relative min-w-0 flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 sm:left-4 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, phone or order ID..."
            className="w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white sm:py-3 sm:pl-12 sm:pr-4 sm:text-base"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white sm:w-auto sm:px-4 sm:py-3"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm sm:rounded-2xl sm:p-10">
          <h2 className="text-lg font-semibold sm:text-xl">
            No matching orders
          </h2>

          <p className="mt-1.5 text-sm text-gray-500 sm:mt-2 sm:text-base">
            Try changing your search or filter.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="min-w-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                {/* Header */}
                <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                      {order.customer_name}
                    </h2>

                    <p className="mt-0.5 truncate text-xs text-gray-500 sm:mt-1 sm:text-sm">
                      {order.customer_phone}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {/* Information */}
                <div className="mt-3 space-y-2 text-sm sm:mt-5 sm:space-y-3 sm:text-base">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="shrink-0">
                      📍 Location:
                    </span>

                    <span className="min-w-0 break-words text-gray-600">
                      {order.address}, {order.city}, {order.state}
                    </span>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-gray-700">
                        💰 Total:
                      </span>

                      <p className="mt-1 truncate text-base font-semibold text-emerald-600 sm:text-lg">
                        {formatCurrency(
                          Number(order.total),
                          order.business.currency
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        {order.payment_method === "pay_on_delivery"
                          ? "Pay on Delivery"
                          : "Online Payment"}
                        {" · "}
                        <span
                          className={
                            order.payment_status === "paid"
                              ? "font-medium text-emerald-600"
                              : order.payment_status === "failed"
                                ? "font-medium text-red-600"
                                : "font-medium text-amber-600"
                          }
                        >
                          {order.payment_status === "paid"
                            ? "Paid"
                            : order.payment_status === "failed"
                              ? "Failed"
                              : order.payment_status === "refunded"
                                ? "Refunded"
                                : "Pending"}
                        </span>
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-gray-400 sm:text-sm">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 flex justify-end sm:mt-5">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 sm:px-4 sm:py-2 sm:text-sm"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-5 flex justify-center sm:mt-8">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingMore}
                className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {loadingMore
                  ? "Loading more orders..."
                  : "Load More Orders"}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
