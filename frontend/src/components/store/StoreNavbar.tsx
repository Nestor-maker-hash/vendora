"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  Home,
  Store,
  Info,
  Phone,
  X,
  Compass,
} from "lucide-react";
import { useCart } from "@/src/features/cart/context/CartContext";
import ContactSellerModal from "./ContactSellerModal";

interface Business {
  id: string;
  name: string;

  phone?: string | null;
  email?: string | null;

  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;

  logo_url?: string | null;
  banner_url?: string | null;

  created_at?: string;
}

interface Props {
  business: Business;

  storeName: string;
  storeHref: string;

  search?: string;
  onSearchChange?: (value: string) => void;
}

export default function StoreNavbar({
  business, 
  storeName,
  storeHref,
  search = "",
  onSearchChange,
}: Props) {

  const { items } = useCart();
const [showSearch, setShowSearch] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
const [contactOpen, setContactOpen] = useState(false);
const [authenticated, setAuthenticated] = useState(false);

useEffect(() => {
  let mounted = true;

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (mounted) {
      setAuthenticated(!!session);
    }
  }

  checkSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setAuthenticated(!!session);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  const cartCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">

      {/* Top Bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        <div className="flex items-center gap-3">
<button
  onClick={() => setMenuOpen(true)}
  className="rounded-lg p-2 transition hover:bg-gray-100"
>
  <Menu size={24} />
</button>
         <Link
  href={storeHref}
  className="text-2xl font-bold text-emerald-600"
>
  Vendora
</Link>
        </div>

        <div className="flex items-center gap-4">

          <button
  onClick={() => setShowSearch(!showSearch)}
  className="rounded-lg p-2 hover:bg-gray-100"
>
  <Search size={22} />
</button>

          <Link
            href="/cart"
            className="relative rounded-lg p-2 hover:bg-gray-100"
          >
            <ShoppingCart size={24} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href={authenticated ? "/buyer" : "/login?next=/buyer"}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label={authenticated ? "My account" : "Sign in"}
            title={authenticated ? "My account" : "Sign in"}
          >
            <User size={22} />
          </Link>

        </div>

      </div>

{showSearch && (
  <div className="border-t bg-white px-4 py-3">
    <div className="mx-auto max-w-7xl">
      <div className="flex items-center rounded-full border bg-gray-50 px-4 py-3">
        <Search
          size={18}
          className="text-gray-500"
        />

<input
  autoFocus
  value={search}
  onChange={(e) => onSearchChange?.(e.target.value)}
  placeholder={`Search ${storeName}...`}
  className="ml-3 w-full bg-transparent outline-none"
/>
      </div>
    </div>
  </div>
)}
{/* Overlay */}
{menuOpen && (
  <div
    onClick={() => setMenuOpen(false)}
    className="fixed inset-0 z-40 bg-black/40"
  />
)}

{/* Drawer */}
<div
  className={`fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-2xl transition-transform duration-300 ${
    menuOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
  <div className="flex items-center justify-between border-b px-4 py-3">
    <h2 className="text-xl font-bold text-emerald-600">
      Vendora
    </h2>

    <button
      onClick={() => setMenuOpen(false)}
      className="rounded-lg p-2 hover:bg-gray-100"
    >
      <X size={22} />
    </button>
  </div>

  <nav className="space-y-1 p-3">

    <Link
  href={storeHref}
  onClick={() => setMenuOpen(false)}
  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-gray-100"
>
      <Home size={18} />
      Home
    </Link>

    <Link
      href="/cart"
      onClick={() => setMenuOpen(false)}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-gray-100"
    >
      <ShoppingCart size={18} />
      Cart
    </Link>

    <button
      onClick={() => {
        setShowSearch(true);
        setMenuOpen(false);
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-gray-100"
    >
      <Search size={18} />
      Search Products
    </button>

    <div className="my-4 border-t" />

    <div className="px-1 pb-2">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
        Store
      </p>
    </div>

    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-gray-700 transition hover:bg-gray-50"
    >
      <Store size={18} className="text-gray-500" />
      <span>About Store</span>
    </button>

    <button
      type="button"
      onClick={() => {
        setMenuOpen(false);
        setContactOpen(true);
      }}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
    >
      <Phone size={18} className="text-gray-500" />
      <span>Contact Seller</span>
    </button>

    <div className="my-4 border-t" />

    <div className="px-1 pb-2">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
        Vendora
      </p>
    </div>

    <Link
      href="/marketplace"
      onClick={() => setMenuOpen(false)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
    >
      <Compass size={18} className="text-gray-500" />

      <span className="flex-1">
        <span className="block text-sm font-medium">
          Marketplace
        </span>
        <span className="text-[11px] text-gray-400">
          Discover more stores
        </span>
      </span>
    </Link>

    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-gray-700 transition hover:bg-gray-50"
    >
      <Info size={18} className="text-gray-500" />
      About Vendora
    </button>

  </nav>

  <div className="absolute bottom-6 w-full px-6">
    <p className="text-center text-sm text-gray-400">
      Powered by <span className="font-semibold">Vendora</span>
    </p>
  </div>
</div>
<ContactSellerModal
  open={contactOpen}
  onClose={() => setContactOpen(false)}
  business={business}
/>
    </header>
  );
}
