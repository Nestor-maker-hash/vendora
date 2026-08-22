"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Bell,
  Radio,
  Smartphone,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";

const navigation = [
  {
    name: "Overview",
    href: "/immortal",
    icon: LayoutDashboard,
  },
  {
    name: "Merchants",
    href: "/immortal/merchants",
    icon: Store,
  },
  {
    name: "Orders",
    href: "/immortal/orders",
    icon: ShoppingCart,
  },
  {
    name: "Products",
    href: "/immortal/products",
    icon: Package,
  },
  {
    name: "Customers",
    href: "/immortal/customers",
    icon: Users,
  },
  {
    name: "Subscriptions",
    href: "/immortal/subscriptions",
    icon: CreditCard,
  },
  {
    name: "Notifications",
    href: "/immortal/notifications",
    icon: Bell,
  },
  {
    name: "Broadcast",
    href: "/immortal/broadcasts",
    icon: Radio,
  },
  {
    name: "Devices",
    href: "/immortal/devices",
    icon: Smartphone,
  },
  {
    name: "Alerts",
    href: "/immortal/alerts",
    icon: AlertTriangle,
  },
];

export default function ImmortalSidebar() {
  const pathname = usePathname();

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-bold text-emerald-400">
            V
          </div>

          <div>
            <p className="text-sm font-bold tracking-[0.25em] text-white">
              VENDORA
            </p>

            <p className="text-xs text-slate-500">
              Immortal
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
          Command
        </p>

        <nav className="space-y-1">
          {navigation.map(({ name, href, icon: Icon }) => {
            const active =
              href === "/immortal"
                ? pathname === "/immortal"
                : pathname.startsWith(href);

            return (
              <Link
                key={name}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={
                    active
                      ? "text-emerald-400"
                      : "text-slate-500 group-hover:text-slate-300"
                  }
                />

                <span>{name}</span>

                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-800 p-4">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
