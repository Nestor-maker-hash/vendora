"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  MessageSquare,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function ImmortalBottomNav() {
  const pathname = usePathname();
  const [storeSlug, setStoreSlug] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadStorefront() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return;
      }

      const { data } = await supabase
        .from("businesses")
        .select("slug")
        .eq("owner_id", session.user.id)
        .maybeSingle();

      if (mounted) {
        setStoreSlug(data?.slug ?? null);
      }
    }

    void loadStorefront();

    return () => {
      mounted = false;
    };
  }, []);

  const items = [
    {
      href: "/immortal",
      label: "Immortal",
      icon: Shield,
      active:
        pathname === "/immortal" ||
        pathname.startsWith("/immortal/") &&
        !pathname.startsWith("/immortal/messages"),
    },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: ShoppingBag,
      active:
        pathname === "/marketplace" ||
        pathname.startsWith("/marketplace/"),
    },
    {
      href: storeSlug ? `/store/${storeSlug}` : "/dashboard",
      label: "Storefront",
      icon: Store,
      active:
        storeSlug !== null &&
        (pathname === `/store/${storeSlug}` ||
          pathname.startsWith(`/store/${storeSlug}/`)),
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active:
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/"),
    },
    {
      href: "/immortal/messages",
      label: "Messages",
      icon: MessageSquare,
      active:
        pathname === "/immortal/messages" ||
        pathname.startsWith("/immortal/messages/"),
    },
  ];

  return (
    <nav
      aria-label="Immortal navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.25)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch justify-around">
        {items.map(
          ({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-semibold transition ${
                active
                  ? "text-emerald-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                  active
                    ? "bg-emerald-500/10"
                    : ""
                }`}
              >
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
      </div>
    </nav>
  );
}
