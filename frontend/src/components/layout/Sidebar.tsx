"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Store,
  Settings,
  LogOut,
  Bell,
  CreditCard,
} from "lucide-react";
import { useSidebar } from "@/src/context/SidebarContext";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import { useUnreadNotifications } from "@/src/features/notifications/hooks/useUnreadNotifications";
import { useCurrentSubscription } from "@/src/features/subscriptions/hooks/useCurrentSubscription";
import { useExchangeRate } from "@/src/features/currency/hooks/useExchangeRate";
import { formatSubscriptionPrice } from "@/src/features/subscriptions/utils/formatSubscriptionPrice";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    name: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const { business } = useBusiness();
  const { subscription } = useCurrentSubscription();
  const unreadCount = useUnreadNotifications();

  const {
    rate: subscriptionExchangeRate,
    loading: subscriptionRateLoading,
  } = useExchangeRate(business?.currency);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <>
      {/* Mobile Dark Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 top-14 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-14 left-0 z-40 flex h-[calc(100vh-3.5rem)] w-56 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-3 sm:p-5">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:mb-3 sm:px-3 sm:text-xs">
            Navigation
          </p>

          <div className="space-y-0.5 sm:space-y-1">
            {links.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                onClick={() => setOpen(false)}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3 ${
                  pathname === href
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={17}
                  className="transition-transform group-hover:scale-110"
                />
                <div className="flex flex-1 items-center justify-between">
                  <span>{name}</span>

                  {name === "Notifications" && unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Merchant Section */}
        <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4">
          <div className="mb-3 rounded-lg bg-white p-3 shadow-sm sm:mb-4 sm:rounded-xl sm:p-4">
            <div className="text-sm font-semibold text-gray-900">
              {business?.name ?? "Your Business"}
            </div>

            <Link
              href="/subscription"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-between rounded-lg border border-gray-200 p-2.5 sm:mt-3 sm:p-3 transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CreditCard size={16} className="text-emerald-600" />

                <div>
                  <p className="text-sm font-medium">
                    {subscription?.subscription_plans?.name ?? "Free Tier"}
                  </p>

                  <p className="text-xs text-gray-500">
                    {subscription?.subscription_plans?.monthly_price
                      ? subscriptionRateLoading
                        ? "Loading price..."
                        : `${formatSubscriptionPrice(
                            Number(
                              subscription.subscription_plans.monthly_price
                            ),
                            business?.currency ?? "NGN",
                            subscriptionExchangeRate
                          )}/month`
                      : "Upgrade your business"}
                  </p>
                </div>
              </div>

              <span className="text-xs font-medium text-emerald-600">→</span>
            </Link>
          </div>

          {business?.slug && (
            <Link
              href={`/store/${business.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3"
            >
              <Store size={18} />
              <span>View Store</span>
            </Link>
          )}
        </div>

        {/* Sign Out */}
        <div className="mt-auto border-t border-gray-200 p-3 sm:p-4">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 sm:gap-3 sm:rounded-xl sm:px-4 sm:py-3"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

