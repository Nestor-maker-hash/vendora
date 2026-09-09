import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Circle,
  MapPin,
  Package,
  Store,
} from "lucide-react";
import { getBuyerOrderById } from "@/src/features/orders/services/getBuyerOrderById";
import { formatCurrency } from "@/src/utils/formatCurrency";
import type { OrderStatus } from "@/src/features/orders/types/order";

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

const trackingSteps: {
  status: OrderStatus;
  label: string;
  description: string;
}[] = [
  {
    status: "pending",
    label: "Order placed",
    description: "Your order has been received.",
  },
  {
    status: "confirmed",
    label: "Order confirmed",
    description: "The store has confirmed your order.",
  },
  {
    status: "processing",
    label: "Preparing order",
    description: "Your items are being prepared.",
  },
  {
    status: "shipped",
    label: "On the way",
    description: "Your order has been handed over for delivery.",
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Your order has been delivered.",
  },
];

const statusRank: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

function PaymentStatus({
  status,
}: {
  status: string;
}) {
  const styles =
    status === "paid"
      ? "bg-emerald-50 text-emerald-700"
      : status === "failed"
        ? "bg-red-50 text-red-700"
        : status === "refunded"
          ? "bg-slate-100 text-slate-700"
          : "bg-amber-50 text-amber-700";

  const label =
    status === "paid"
      ? "Paid"
      : status === "failed"
        ? "Payment failed"
        : status === "refunded"
          ? "Refunded"
          : "Payment pending";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${styles}`}
    >
      {label}
    </span>
  );
}

export default async function BuyerOrderDetailsPage({
  params,
}: Props) {
  const { orderId } = await params;
  const order = await getBuyerOrderById(orderId);

  const isCancelled = order.status === "cancelled";
  const currentRank = statusRank[order.status];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/buyer/orders"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            <span>My Orders</span>
          </Link>

          <Link href="/marketplace">
            <img
              src="/icon.png"
              alt="Vendora"
              className="h-9 w-9 rounded-xl object-cover"
            />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            Order details
          </p>

          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>

            <PaymentStatus status={order.payment_status} />
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Placed{" "}
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Tracking */}
        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
          <div className="flex items-center gap-2">
            <Package size={19} className="text-emerald-600" />

            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Track your order
            </h2>
          </div>

          {isCancelled ? (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="font-semibold text-red-700">
                This order was cancelled.
              </p>

              <p className="mt-1 text-sm text-red-600">
                Please contact the store if you need more information.
              </p>
            </div>
          ) : (
            <div className="mt-6">
              {trackingSteps.map((step, index) => {
                const stepRank = statusRank[step.status];
                const completed = currentRank >= stepRank;
                const current = currentRank === stepRank;
                const isLast = index === trackingSteps.length - 1;

                return (
                  <div
                    key={step.status}
                    className="relative flex gap-4"
                  >
                    {!isLast && (
                      <div
                        className={`absolute left-[11px] top-6 h-[calc(100%-2px)] w-px ${
                          currentRank > stepRank
                            ? "bg-emerald-500"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                    <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
                      {completed ? (
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            current
                              ? "bg-emerald-600"
                              : "bg-emerald-500"
                          }`}
                        >
                          <Check
                            size={14}
                            strokeWidth={3}
                            className="text-white"
                          />
                        </span>
                      ) : (
                        <Circle
                          size={14}
                          className="fill-white text-slate-300"
                        />
                      )}
                    </div>

                    <div
                      className={`pb-6 ${
                        isLast ? "pb-0" : ""
                      }`}
                    >
                      <p
                        className={`text-sm font-bold ${
                          completed
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Delivery PIN */}
        {!isCancelled &&
          order.status !== "delivered" &&
          order.delivery_pin && (
            <section className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <Package
                    size={19}
                    className="text-emerald-700"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    Delivery PIN
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Give this PIN to the delivery person when your order arrives.
                  </p>

                  <div className="mt-4 inline-flex rounded-xl border border-emerald-200 bg-white px-5 py-3">
                    <span className="font-mono text-2xl font-extrabold tracking-[0.35em] text-slate-950">
                      {order.delivery_pin}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-emerald-800">
                    Keep this PIN private until your order is delivered.
                  </p>
                </div>
              </div>
            </section>
          )}

        {/* Store */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Store
                size={19}
                className="text-emerald-600"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Store
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {order.business.name}
              </p>
            </div>
          </div>
        </section>

        {/* Items */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Items in this order
          </h2>

          <div className="mt-5 divide-y divide-slate-100">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {item.product_name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Qty {item.quantity}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-bold text-slate-900">
                  {formatCurrency(
                    Number(item.price) * item.quantity,
                    order.business.currency
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Delivery */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <MapPin
              size={19}
              className="text-emerald-600"
            />

            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Delivery information
            </h2>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {order.customer_name}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {order.address}
              <br />
              {order.city}, {order.state}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {order.customer_phone}
            </p>
          </div>

          {order.notes && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Order note
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {order.notes}
              </p>
            </div>
          )}
        </section>

        {/* Payment summary */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Payment summary
          </h2>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Subtotal
              </span>

              <span className="font-medium text-slate-900">
                {formatCurrency(
                  Number(order.subtotal),
                  order.business.currency
                )}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-500">
                Delivery
              </span>

              <span className="font-medium text-slate-900">
                {formatCurrency(
                  Number(order.delivery_fee),
                  order.business.currency
                )}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex justify-between gap-4">
                <span className="font-bold text-slate-900">
                  Total
                </span>

                <span className="font-extrabold text-emerald-600">
                  {formatCurrency(
                    Number(order.total),
                    order.business.currency
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-xs text-slate-500">
              Payment method
            </span>

            <span className="text-xs font-bold text-slate-800">
              {order.payment_method === "pay_on_delivery"
                ? "Pay on Delivery"
                : "Online Payment"}
            </span>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href="/buyer/orders"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
          >
            Back to My Orders
          </Link>

          <Link
            href="/marketplace"
            className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
