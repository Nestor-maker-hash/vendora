import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CreditCard,
  Package,
  ShoppingCart,
  Smartphone,
  Users,
  AlertTriangle,
  Store,
} from "lucide-react";
import { notFound } from "next/navigation";
import { getImmortalMerchant } from "@/src/features/immortal/services/getImmortalMerchant";

interface MerchantPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

function formatCurrency(
  value: number,
  currency = "NGN"
) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

export default async function ImmortalMerchantPage({
  params,
}: MerchantPageProps) {
  const { businessId } = await params;

  const merchant =
    await getImmortalMerchant(businessId);

  if (!merchant) {
    notFound();
  }

const { business, stats } = merchant;

const currency = business.currency || "NGN";

const cards = [

    {
      label: "Products",
      value: formatNumber(stats.products),
      icon: Package,
    },
    {
      label: "Orders",
      value: formatNumber(stats.orders),
      icon: ShoppingCart,
    },
    {
      label: "Customers",
      value: formatNumber(stats.customers),
      icon: Users,
    },
    {
      label: "Order Value",
      value: formatCurrency(stats.revenue, currency),
      icon: CreditCard,
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <Link
          href="/immortal/merchants"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to merchants
        </Link>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <Store
                  size={24}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">
                    {business.name}
                  </h1>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      business.store_ready_acknowledged
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {business.store_ready_acknowledged
                      ? "Store Ready"
                      : "Setup Pending"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  /{business.slug}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs uppercase tracking-wider text-slate-600">
                Merchant Since
              </p>

              <p className="mt-1 text-sm text-slate-300">
                {formatDate(business.created_at)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(
            ({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {label}
                    </p>

                    <p className="mt-3 text-2xl font-bold text-white">
                      {value}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                    <Icon
                      size={19}
                      className="text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-semibold text-white">
              Business
            </h2>

            <div className="mt-5 space-y-4 text-sm">
              <Info
                label="Category"
                value={business.category}
              />
              <Info
                label="Email"
                value={business.email}
              />
              <Info
                label="Phone"
                value={business.phone}
              />
              <Info
                label="Location"
                value={[
                  business.city,
                  business.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              />
              <Info
                label="Currency"
                value={business.currency}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center gap-3">
              <CreditCard
                size={19}
                className="text-emerald-400"
              />

              <h2 className="font-semibold text-white">
                Subscription
              </h2>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              
            <Info
  label="Plan"
  value={
    merchant.subscription?.subscription_plans?.name ??
    "No subscription"
  }
/>

              <Info
                label="Status"
                value={
                  merchant.subscription?.status ??
                  "—"
                }
              />

              <Info
                label="Expires"
                value={formatDate(
                  merchant.subscription?.expires_at ??
                    null
                )}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-semibold text-white">
              Attention
            </h2>

            <div className="mt-5 space-y-3">
              <Attention
                icon={ShoppingCart}
                label="Pending orders"
                value={stats.pendingOrders}
              />

              <Attention
                icon={AlertTriangle}
                label="Low stock"
                value={stats.lowStockProducts}
              />

              <Attention
                icon={Bell}
                label="Unread notifications"
                value={stats.unreadNotifications}
              />

              <Attention
                icon={Smartphone}
                label="Active devices"
                value={stats.activeDevices}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-semibold text-white">
              Recent Orders
            </h2>

            <div className="mt-5 overflow-x-auto">
              {merchant.orders.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No orders yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {merchant.orders
                    .slice(0, 8)
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {order.customer_name}
                          </p>

                          <p className="text-xs text-slate-600">
                            {formatDate(
                              order.created_at
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {formatCurrency(
                              Number(order.total),
                              business.currency
                            )}
                          </p>

                          <p className="text-[10px] uppercase text-slate-600">
                            {order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="font-semibold text-white">
              Products
            </h2>

            <div className="mt-5 space-y-2">
              {merchant.products
                .slice(0, 8)
                .map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {product.name}
                      </p>

                      <p className="text-xs text-slate-600">
                        {formatCurrency(
                          Number(product.price),
                          business.currency
                        )}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold ${
                        product.stock <= 5
                          ? "text-amber-400"
                          : "text-slate-400"
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </div>
                ))}

              {merchant.products.length === 0 && (
                <p className="text-sm text-slate-600">
                  No products yet.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs text-slate-600">
        {label}
      </p>

      <p className="mt-1 break-words text-slate-300">
        {value || "—"}
      </p>
    </div>
  );
}

function Attention({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof AlertTriangle;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon
          size={16}
          className="text-slate-500"
        />

        <span className="text-sm text-slate-400">
          {label}
        </span>
      </div>

      <span className="font-semibold text-white">
        {formatNumber(value)}
      </span>
    </div>
  );
}
