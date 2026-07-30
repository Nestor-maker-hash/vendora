"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatCurrency } from "@/src/utils/formatCurrency";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  address: string;
  city: string;
  state: string;
  total: number;
  status: string;
  created_at: string;
  business: {
    currency: string;
  };
}

interface Props {
  orders: Order[];
}

export default function OrdersList({
  orders,
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

    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-center">
	<div className="relative flex-1">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 outline-none transition focus:border-emerald-500 focus:bg-white"
  />
</div>
	<select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
>
  <option value="all">All Statuses</option>
  <option value="pending">Pending</option>
  <option value="processing">Processing</option>
  <option value="confirmed">Confirmed</option>
  <option value="shipped">Shipped</option>
  <option value="delivered">Delivered</option>
  <option value="cancelled">Cancelled</option>
</select>

      </div>



<div className="space-y-4">
  {filteredOrders.map((order) => (
    <div
      key={order.id}
      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-gray-900">
            {order.customer_name}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {order.customer_phone}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {/* Information */}
      <div className="mt-5 space-y-3">

        <div className="flex items-center gap-2 ">
          <span>📍Location:</span>
          <span className="truncate">
            {order.address}, {order.city}, {order.state}
          </span>
        </div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">
            <span>💰Total:</span>

            <span className="text-lg font-semibold text-emerald-600">
              {formatCurrency(
  Number(order.total),
  order.business.currency
)}
            </span>
          </div>

          <span className="text-sm text-gray-400">
            {new Date(order.created_at).toLocaleDateString()}
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-5 flex justify-end">
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          View Details →
        </Link>
      </div>

    </div>
  ))}
</div>


    </>
  );
}
