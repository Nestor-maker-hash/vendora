import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

import BuyerNotificationsList from "@/src/features/buyerNotifications/components/BuyerNotificationsList";

export default function BuyerNotificationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/buyer"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            <span>My account</span>
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
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            Updates
          </p>

          <div className="mt-1.5 flex items-center gap-3">
            <Bell size={24} className="text-slate-900" />

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Notifications
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Stay updated on your orders and deliveries.
          </p>
        </div>

        <div className="mt-7 sm:mt-8">
          <BuyerNotificationsList />
        </div>
      </div>
    </main>
  );
}
