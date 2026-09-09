"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Store,
  ShoppingCart,
  UserRound,
  Plus,
} from "lucide-react";
import { useCart } from "@/src/features/cart/context/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { getBusinessAfterLogin } from "@/src/features/auth/services/getBusinessAfterLogin";

export default function BuyerBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  const [hasBusiness, setHasBusiness] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkBusiness() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        if (mounted) {
          setAuthenticated(false);
          setHasBusiness(false);
        }
        return;
      }

      if (mounted) {
        setAuthenticated(true);
      }

      try {
        const business = await getBusinessAfterLogin(session.user.id);

        if (mounted) {
          setHasBusiness(!!business);
        }
      } catch (error) {
        console.error("Failed to check buyer business:", error);

        if (mounted) {
          setHasBusiness(false);
        }
      }
    }

    void checkBusiness();

    return () => {
      mounted = false;
    };
  }, []);

  const sellHref = !authenticated
    ? "/create-account"
    : hasBusiness
      ? "/dashboard"
      : "/onboarding";

  const sellLabel = hasBusiness
    ? "My Business"
    : "Start Selling";

  const items = [
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: Store,
      active:
        pathname === "/marketplace" ||
        pathname.startsWith("/marketplace/"),
    },
    {
      href: "/buyer/orders",
      label: "Orders",
      icon: ShoppingBag,
      active:
        pathname === "/buyer/orders" ||
        pathname.startsWith("/buyer/orders/"),
    },
    {
      href: sellHref,
      label: sellLabel,
      icon: Plus,
      active:
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/onboarding",
      emphasized: true,
    },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingCart,
      active: pathname === "/cart",
    },
    {
      href: "/buyer/profile",
      label: "Profile",
      icon: UserRound,
      active:
        pathname === "/buyer/profile" ||
        pathname === "/buyer/addresses" ||
        pathname === "/buyer/notifications" ||
        pathname === "/buyer",
    },
  ];

  return (
    <nav
      aria-label="Buyer navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {items.map(
          ({
            href,
            label,
            icon: Icon,
            active,
            emphasized,
          }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold transition ${
                active
                  ? "text-emerald-600"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition ${
                  emphasized
                    ? active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-600"
                    : ""
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 2} />

                {label === "Cart" && cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[8px] font-bold text-white ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>

              <span className="max-w-[72px] truncate">
                {label}
              </span>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
