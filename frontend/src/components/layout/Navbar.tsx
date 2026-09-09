"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useSidebar } from "@/src/context/SidebarContext";
import Link from "next/link";
import { useUnreadNotifications } from "@/src/features/notifications/hooks/useUnreadNotifications";

export default function Navbar() {
  const { open, setOpen } = useSidebar();
  const unreadCount = useUnreadNotifications();
  
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-3 sm:px-5 backdrop-blur">

      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-4">

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-1.5 transition hover:bg-gray-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-xl font-bold tracking-tight text-emerald-600 sm:text-2xl">
          Vendora
        </h1>

      </div>

      {/* Center */}
      <div className="hidden w-full max-w-md lg:block">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            placeholder="Search..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 outline-none transition focus:border-emerald-500 focus:bg-white"
          />

        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">

      <Link
  href="/dashboard/notifications"
  className="relative rounded-lg border border-gray-200 bg-white p-1.5 transition hover:bg-gray-50 sm:rounded-xl sm:p-2"
>
  <Bell size={18} />

  {unreadCount > 0 && (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</Link>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 sm:rounded-xl sm:px-3 sm:py-2">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white sm:h-10 sm:w-10 sm:text-base">
            N
          </div>

          <div className="hidden text-left md:block">

            <p className="text-sm font-semibold text-gray-900">
              Nestor
            </p>

            <p className="text-xs text-gray-500">
              Merchant
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}
