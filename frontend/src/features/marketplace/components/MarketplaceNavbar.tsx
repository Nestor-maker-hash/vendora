"use client";

import Link from "next/link";
import { ShoppingCart, Store, UserRound } from "lucide-react";
import { useCart } from "@/src/features/cart/context/CartContext";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { getBusinessAfterLogin } from "@/src/features/auth/services/getBusinessAfterLogin";
import { setPWAContext } from "@/src/lib/pwa-context";

export default function MarketplaceNavbar() {
  const { cartCount, getBusinessIds } = useCart();
  const [authenticated, setAuthenticated] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);

  useEffect(() => {
    setPWAContext("marketplace");

    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session?.user) {
        setAuthenticated(false);
        setHasBusiness(false);
        return;
      }

      setAuthenticated(true);

      try {
        const business = await getBusinessAfterLogin(
          session.user.id
        );

        if (mounted) {
          setHasBusiness(!!business);
        }
      } catch (error) {
        console.error(
          "Failed to check marketplace business:",
          error
        );

        if (mounted) {
          setHasBusiness(false);
        }
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setAuthenticated(false);
        setHasBusiness(false);
        return;
      }

      setAuthenticated(true);

      void getBusinessAfterLogin(session.user.id)
        .then((business) => {
          if (mounted) {
            setHasBusiness(!!business);
          }
        })
        .catch((error) => {
          console.error(
            "Failed to check marketplace business:",
            error
          );

          if (mounted) {
            setHasBusiness(false);
          }
        });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const businessCount = getBusinessIds().length;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-1.5 px-2 sm:gap-3 sm:px-6">
        <Link
          href="/marketplace"
          className="flex shrink-0 items-center gap-2"
        >
          <img
            src="/icon.png"
            alt="Vendora"
            className="h-9 w-9 rounded-xl object-cover"
          />

          <span className="hidden text-lg font-extrabold tracking-tight text-slate-950 sm:block">
            Vendora
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <Link
            href="/marketplace"
            className="flex shrink-0 items-center gap-0.5 rounded-lg px-1.5 py-2 text-[9px] font-medium text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600 sm:gap-1.5 sm:px-2.5 sm:text-xs"
          >
            <Store size={15} />
            <span>{businessCount || "Stores"}</span>
          </Link>

          <Link
            href={
              !authenticated
                ? "/create-account"
                : hasBusiness
                  ? "/dashboard"
                  : "/onboarding"
            }
            className="flex shrink-0 items-center gap-0.5 rounded-lg bg-emerald-600 px-1.5 py-1.5 text-[9px] font-semibold text-white transition hover:bg-emerald-700 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs"
            aria-label={
              authenticated && hasBusiness
                ? "My Business"
                : "Start Selling"
            }
            title={
              authenticated && hasBusiness
                ? "My Business"
                : "Start Selling"
            }
          >
            <Store size={15} />
            <span>
              {authenticated && hasBusiness
                ? "My Business"
                : "Start Selling"}
            </span>
          </Link>

          <Link
            href={authenticated ? "/buyer" : "/login?next=/buyer"}
            className="ml-auto rounded-xl p-1.5 text-slate-700 transition hover:bg-slate-100 sm:p-2"
            aria-label={authenticated ? "My account" : "Sign in"}
            title={authenticated ? "My account" : "Sign in"}
          >
            <UserRound size={20} />
          </Link>

          <Link
            href="/cart"
            className="relative rounded-xl p-1.5 text-slate-700 transition hover:bg-slate-100 sm:p-2"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={20} />

            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[8px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
