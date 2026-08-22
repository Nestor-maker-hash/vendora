"use client";

import {
  Bell,
  Menu,
  Search,
} from "lucide-react";

interface ImmortalTopbarProps {
  email?: string;
  onMenuClick: () => void;
}

export default function ImmortalTopbar({
  email,
  onMenuClick,
}: ImmortalTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Vendora
          </p>

          <p className="text-sm font-semibold text-white">
            Immortal Command Center
          </p>
        </div>
      </div>

      <div className="hidden max-w-md flex-1 px-8 md:block">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="search"
            placeholder="Search the platform..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-400 transition hover:border-slate-700 hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="hidden items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            S
          </div>

          <div className="max-w-40">
            <p className="truncate text-xs font-semibold text-white">
              {email ?? "Super Admin"}
            </p>

            <p className="text-[11px] text-emerald-400">
              Platform Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
