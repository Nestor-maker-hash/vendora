
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Compass,
  Menu,
} from "lucide-react";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import { useSidebar } from "@/src/context/SidebarContext";

export default function MerchantBottomNav() {
  const pathname = usePathname();
  const { business } = useBusiness();
  const { open, setOpen } = useSidebar();

  const storeHref = business?.slug
    ? `/store/${business.slug}`
    : "/dashboard";

  const moreRoutes = [
    "/products",
    "/payments",
    "/dashboard/notifications",
    "/customers",
    "/analytics",
    "/settings",
    "/subscription",
  ];

  const moreActive =
    open ||
    moreRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`)
    );

  const items = [
    {
      href: "/dashboard",
      label: "Home",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/orders",
      label: "Orders",
      icon: ShoppingBag,
      active:
        pathname === "/dashboard/orders" ||
        pathname.startsWith("/dashboard/orders/"),
    },
    {
      href: storeHref,
      label: "My Store",
      icon: Store,
      active:
        !!business?.slug &&
        (pathname === `/store/${business.slug}` ||
          pathname.startsWith(`/store/${business.slug}/`)),
    },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: Compass,
      active:
        pathname === "/marketplace" ||
        pathname.startsWith("/marketplace/"),
    },
  ];

  return (
    <nav
      aria-label="Merchant navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {items.map(
          ({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              aria-label={label}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold transition ${
                active
                  ? "text-emerald-600"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl">
                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 2}
                />
              </span>

              <span className="max-w-[72px] truncate">
                {label}
              </span>
            </Link>
          )
        )}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="More"
          aria-expanded={open}
          className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold transition ${
            moreActive
              ? "text-emerald-600"
              : "text-slate-400 hover:text-slate-700"
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
              moreActive ? "bg-emerald-50" : ""
            }`}
          >
            <Menu
              size={18}
              strokeWidth={moreActive ? 2.4 : 2}
            />
          </span>

          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
