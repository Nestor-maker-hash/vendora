"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Globe2,
  LayoutDashboard,
  Package,
  ShoppingCart,
} from "lucide-react";

import DashboardPreview from "./DashboardPreview";
import StorefrontPreview from "./StorefrontPreview";

type Preview = {
  id: string;
  label: string;
  eyebrow: string;
  description: string;
  icon: typeof LayoutDashboard;
  component: React.ReactNode;
};

export default function ProductPreview() {
  const [activeIndex, setActiveIndex] = useState(0);

  const previews: Preview[] = [
    {
      id: "dashboard",
      label: "Merchant Dashboard",
      eyebrow: "Run your business",
      description:
        "Manage your business from one connected workspace.",
      icon: LayoutDashboard,
      component: <DashboardPreview />,
    },
    {
      id: "storefront",
      label: "Online Store",
      eyebrow: "Sell online",
      description:
        "Give customers a professional place to discover and buy your products.",
      icon: Globe2,
      component: <StorefrontPreview />,
    },
    {
      id: "products",
      label: "Products",
      eyebrow: "Manage your catalogue",
      description:
        "Organize products, pricing and inventory from one place.",
      icon: Package,
      component: (
        <div className="min-h-[390px] bg-white p-5 sm:p-8">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Catalogue
                </p>

                <h3 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                  Your Products
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Manage everything you sell.
                </p>
              </div>

              <div className="hidden rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm sm:block">
                Add Product
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Classic Tote Bag", "₦18,500", "42 in stock"],
                ["Premium Sneakers", "₦42,000", "18 in stock"],
                ["Linen Shirt", "₦25,000", "31 in stock"],
              ].map(([name, price, stock]) => (
                <div
                  key={name}
                  className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    <Package
                      className="text-gray-300"
                      size={34}
                    />
                  </div>

                  <h4 className="mt-3 truncate text-sm font-semibold text-gray-900">
                    {name}
                  </h4>

                  <p className="mt-1 text-sm font-bold text-emerald-600">
                    {price}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      {stock}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "orders",
      label: "Orders",
      eyebrow: "Stay on top of sales",
      description:
        "Track every order from checkout through fulfillment.",
      icon: ShoppingCart,
      component: (
        <div className="min-h-[390px] bg-white p-5 sm:p-8">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Sales
              </p>

              <h3 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                Recent Orders
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                See what customers are buying and keep orders moving.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {[
                [
                  "Ada Okafor",
                  "Classic Tote Bag",
                  "₦18,500",
                  "Paid",
                ],
                [
                  "Chinedu Eze",
                  "Premium Sneakers",
                  "₦42,000",
                  "Pending",
                ],
                [
                  "Amaka Nwosu",
                  "Linen Shirt",
                  "₦25,000",
                  "Paid",
                ],
              ].map(
                ([customer, product, amount, status], index) => (
                  <div
                    key={customer}
                    className={`flex items-center justify-between p-4 ${
                      index !== 2
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                        {customer.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                          {customer}
                        </p>

                        <p className="mt-1 truncate text-[10px] text-gray-500 sm:text-xs">
                          {product}
                        </p>
                      </div>
                    </div>

                    <div className="ml-3 text-right">
                      <p className="text-xs font-bold text-gray-900 sm:text-sm">
                        {amount}
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          status === "Paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "analytics",
      label: "Business Intelligence",
      eyebrow: "Understand your business",
      description:
        "Turn business activity into insights that help you make better decisions.",
      icon: BarChart3,
      component: (
        <div className="min-h-[390px] bg-white p-5 sm:p-8">
          <div className="mx-auto w-full max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Business Intelligence
            </p>

            <h3 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              Business Performance
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Understand what is happening across your business.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ["Total Sales", "₦1,284,500", "+18.4%"],
                ["Orders", "128", "+12.8%"],
                ["Customers", "342", "+21"],
              ].map(([label, value, change]) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                  <p className="text-[10px] font-medium text-gray-500">
                    {label}
                  </p>

                  <p className="mt-2 text-xl font-bold tracking-tight text-gray-900">
                    {value}
                  </p>

                  <p className="mt-2 text-[10px] font-semibold text-emerald-600">
                    {change} this period
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    Sales performance
                  </p>

                  <p className="mt-0.5 text-[9px] text-gray-400">
                    Recent activity
                  </p>
                </div>

                <BarChart3
                  size={16}
                  className="text-emerald-600"
                />
              </div>

              <div className="mt-5 flex h-24 items-end gap-2">
                {[35, 55, 42, 70, 58, 82, 68, 94, 76, 100].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-md bg-emerald-500/70"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const activePreview = previews[activeIndex];
  const Icon = activePreview.icon;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % previews.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [previews.length]);

  function previous() {
    setActiveIndex(
      (current) =>
        (current - 1 + previews.length) % previews.length
    );
  }

  function next() {
    setActiveIndex(
      (current) => (current + 1) % previews.length
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
      {/* Section heading */}
      <div className="mb-8 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
          <Icon size={13} />
          {activePreview.eyebrow}
        </div>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          See what you can build with Vendora.
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
          A connected platform for your storefront, products,
          orders, customers and business operations.
        </p>
      </div>

      {/* Product showcase */}
      <div className="relative rounded-3xl border border-gray-200 bg-gray-100 p-2 shadow-2xl shadow-gray-200/80 sm:p-3">
        {/* Browser-style header */}
        <div className="flex h-9 items-center gap-1.5 rounded-t-2xl border-b border-gray-200 bg-white px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />

          <div className="mx-auto hidden max-w-xs flex-1 rounded-md bg-gray-50 px-4 py-1 text-center text-[8px] text-gray-400 sm:block">
            app.vendora
          </div>

          <div className="w-12 sm:w-20" />
        </div>

        <div className="relative overflow-hidden rounded-b-2xl bg-white">
          {activePreview.component}
        </div>

        {/* Navigation arrows */}
        <button
          type="button"
          onClick={previous}
          aria-label="Previous preview"
          className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white sm:left-6"
        >
          <ArrowLeft size={17} />
        </button>

        <button
          type="button"
          onClick={next}
          aria-label="Next preview"
          className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white sm:right-6"
        >
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Slide controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {previews.map((preview, index) => {
          const PreviewIcon = preview.icon;
          const active = index === activeIndex;

          return (
            <button
              key={preview.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              }`}
            >
              <PreviewIcon size={13} />
              {preview.label}
            </button>
          );
        })}
      </div>

      {/* Active slide description */}
      <div className="mt-4 text-center">
        <p className="font-semibold text-gray-900">
          {activePreview.label}
        </p>

        <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-gray-500">
          {activePreview.description}
        </p>
      </div>
    </div>
  );
}
