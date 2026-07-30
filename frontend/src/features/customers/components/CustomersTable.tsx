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
    <div className="rounded-2xl border bg-white p-8 text-center">
      Loading customers...
    </div>
  );
}

  return (
    <>
      <div className="mb-6">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Orders
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Total Spent
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Last Order
              </th>

              <th className="px-6 py-4"></th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.phone}
                className="border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4">
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

                <td className="px-6 py-4">
                  {customer.orders}
                </td>

                <td className="px-6 py-4 font-medium">
                  {formatCurrency(customer.totalSpent, currency)}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(
                    customer.lastOrder
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
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
