import Link from "next/link";
import { Bell, ShoppingBag, UserRound, MapPin } from "lucide-react";

export default function BuyerPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/marketplace"
            className="flex items-center gap-2"
          >
            <img
              src="/icon.png"
              alt="Vendora"
              className="h-9 w-9 rounded-xl object-cover"
            />

            <span className="text-lg font-extrabold tracking-tight text-slate-950">
              Vendora
            </span>
          </Link>

          <Link
            href="/marketplace"
            className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-600"
          >
            Continue shopping
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            My Vendora
          </p>

          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Your shopping account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your orders, profile and saved delivery information.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/buyer/orders"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <ShoppingBag
              size={20}
              className="text-emerald-600"
            />

            <h2 className="mt-4 font-bold text-slate-900">
              My Orders
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              View your orders and track deliveries.
            </p>
          </Link>

          <Link
            href="/buyer/profile"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <UserRound
              size={20}
              className="text-emerald-600"
            />

            <h2 className="mt-4 font-bold text-slate-900">
              My Profile
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Manage your personal shopping information.
            </p>
          </Link>

          <Link
            href="/buyer/addresses"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <MapPin
              size={20}
              className="text-emerald-600"
            />

            <h2 className="mt-4 font-bold text-slate-900">
              Delivery Addresses
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Save addresses for faster checkout.
            </p>
          </Link>
          <Link
            href="/buyer/notifications"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <Bell
              size={20}
              className="text-emerald-600"
            />

            <h2 className="mt-4 font-bold text-slate-900">
              Notifications
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              See updates about your orders and deliveries.
            </p>
          </Link>

        </div>
      </div>
    </main>
  );
}
