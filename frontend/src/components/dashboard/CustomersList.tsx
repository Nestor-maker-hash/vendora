"use client";

import { useMemo, useState } from "react";
import { Customer } from "@/src/features/customers/types/customer";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";

interface Props {
  customers: Customer[];
}

export default function CustomersList({
  customers,
}: Props) {
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

  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold">
          No customers yet
        </h2>

        <p className="mt-2 text-gray-500">
          Customers will appear here after they place orders.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer..."
          className="w-full rounded-xl border p-3"
        />
      </div>

      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.phone}
            className="rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {customer.name}
                </h2>

                <p className="text-sm text-gray-500">
                  {customer.phone}
                </p>

                {customer.email && (
                  <p className="text-sm text-gray-500">
                    {customer.email}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Total Spent
                </p>

                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(customer.totalSpent, currency)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-6 text-sm text-gray-600">
              <p>
                <strong>Orders:</strong> {customer.orders}
              </p>

              <p>
                <strong>Last Order:</strong>{" "}
                {new Date(customer.lastOrder).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
