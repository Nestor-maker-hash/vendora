"use client";

import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, active: true },
  { name: "Products", icon: Package },
  { name: "Orders", icon: ShoppingCart },
  { name: "Payments", icon: CreditCard },
  { name: "Customers", icon: Users },
  { name: "Analytics", icon: BarChart3 },
];

const orders = [
  {
    customer: "Amaka Store",
    product: "Classic Sneakers",
    amount: "₦45,000",
    status: "Delivered",
  },
  {
    customer: "David Okoro",
    product: "Premium T-Shirt",
    amount: "₦18,500",
    status: "Pending",
  },
  {
    customer: "Ada Fashion",
    product: "Leather Handbag",
    amount: "₦32,000",
    status: "Confirmed",
  },
];

export default function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Top bar */}
      <div className="flex h-12 items-center justify-between border-b border-gray-100 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <ShoppingCart size={13} />
          </div>

          <span className="text-sm font-bold text-gray-900">
            Vendora
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Bell size={15} className="text-gray-400" />

          <div className="h-7 w-7 rounded-full bg-emerald-100" />
        </div>
      </div>

  <div className="grid min-h-[390px] grid-cols-1 sm:grid-cols-[150px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-gray-100 bg-gray-50 p-3 sm:block">
          <p className="mb-3 px-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">
            Navigation
          </p>

          <div className="space-y-1">
            {navigation.map(({ name, icon: Icon, active }) => (
              <div
                key={name}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-medium ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-gray-500"
                }`}
              >
                <Icon size={13} />
                {name}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-gray-100 bg-white p-3">
            <p className="text-[9px] text-gray-400">
              YOUR STORE
            </p>

            <p className="mt-1 text-[10px] font-semibold text-gray-800">
              nestor-fashion
            </p>

            <div className="mt-2 rounded-md bg-emerald-50 px-2 py-1.5 text-center text-[9px] font-medium text-emerald-700">
              View Store
            </div>
          </div>
        </aside>

        {/* Main dashboard */}
        <div className="min-w-0 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                Dashboard
              </h3>

              <p className="mt-1 text-[10px] text-gray-400 sm:text-xs">
                Here's what's happening with your business.
              </p>
            </div>

            <div className="hidden rounded-lg bg-emerald-600 px-3 py-2 text-[9px] font-semibold text-white sm:block">
              View Store
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Revenue", "₦248,500"],
              ["Orders", "42"],
              ["Customers", "31"],
              ["Products", "86"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-gray-100 p-3"
              >
                <p className="text-[9px] text-gray-400">
                  {label}
                </p>

    <p className="mt-1 truncate text-sm font-bold text-gray-900 sm:text-base">
      {value}
    </p>

                <p className="mt-1 text-[8px] font-medium text-emerald-600">
                  +12.5%
                </p>
              </div>
            ))}
          </div>

          {/* Orders + chart */}
          <div className="mt-4 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-lg border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-800">
                    Recent Orders
                  </p>

                  <p className="mt-0.5 text-[8px] text-gray-400">
                    Latest customer activity
                  </p>
                </div>

                <span className="text-[8px] font-medium text-emerald-600">
                  View all →
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {orders.map((order) => (
                  <div
                    key={order.customer}
                    className="flex items-center justify-between rounded-md bg-gray-50 p-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[9px] font-semibold text-gray-800">
                        {order.customer}
                      </p>

                      <p className="truncate text-[8px] text-gray-400">
                        {order.product}
                      </p>
                    </div>

                    <div className="ml-2 text-right">
                      <p className="text-[9px] font-bold text-gray-800">
                        {order.amount}
                      </p>

                      <p
                        className={`text-[7px] font-medium ${
                          order.status === "Delivered"
                            ? "text-emerald-600"
                            : order.status === "Pending"
                            ? "text-amber-600"
                            : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-[10px] font-semibold text-gray-800">
                Sales Overview
              </p>

              <p className="mt-0.5 text-[8px] text-gray-400">
                Last 7 days
              </p>

              <div className="mt-5 flex h-28 items-end gap-1.5">
                {[35, 48, 42, 68, 55, 78, 90].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t bg-emerald-100"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  )
                )}
              </div>

              <div className="mt-2 flex justify-between text-[7px] text-gray-400">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
