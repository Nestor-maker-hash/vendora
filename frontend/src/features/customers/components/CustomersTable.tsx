"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Input from "@/src/components/ui/Input";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { useCustomers } from "../hooks/useCustomers";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

export default function CustomersTable() {
  const { customers, loading } = useCustomers();

  const [search, setSearch] = useState("");
const { currency } = useBusiness();

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      customer.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      customer.phone.includes(search) ||
      (customer.email ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [customers, search]);

if (loading) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border bg-white shadow-sm">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_0.7fr] gap-4 border-b bg-gray-50 px-3 py-3 sm:px-6 sm:py-4">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_0.7fr] items-center gap-4 px-3 py-4 sm:px-6"
            >
              <div className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>

              <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />

              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />

              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

              <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

  return (
    <>
      <div className="mb-4 sm:mb-6">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="min-w-0 overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-sm font-semibold">
                Customer
              </th>

              <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-sm font-semibold">
                Orders
              </th>

              <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-sm font-semibold">
                Total Spent
              </th>

              <th className="px-3 py-3 sm:px-6 sm:py-4 text-left text-sm font-semibold">
                Last Order
              </th>

              <th className="px-3 py-3 sm:px-6 sm:py-4"></th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.phone}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-3 py-3 sm:px-6 sm:py-4">
                  <div className="font-medium">
                    {customer.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {customer.phone}
                  </div>

                  {customer.email && (
                    <div className="text-sm text-gray-500">
                      {customer.email}
                    </div>
                  )}
                </td>

                <td className="px-3 py-3 sm:px-6 sm:py-4">
                  {customer.orders}
                </td>

                <td className="px-3 py-3 sm:px-6 sm:py-4 font-medium">
                  {formatCurrency(customer.totalSpent, currency)}
                </td>

                <td className="px-3 py-3 sm:px-6 sm:py-4 text-sm text-gray-500">
                  {new Date(
                    customer.lastOrder
                  ).toLocaleDateString()}
                </td>

                <td className="px-3 py-3 sm:px-6 sm:py-4">
                  <Link
                    href={`/customers/${encodeURIComponent(customer.phone)}`}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-gray-500"
                >
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
