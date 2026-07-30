"use client";

import Link from "next/link";
import { useState } from "react";
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
} from "lucide-react";
import { useCart } from "@/src/features/cart/context/CartContext";
import ContactSellerModal from "./ContactSellerModal";

interface Business {
  id: string;
  name: string;

  phone?: string | null;
  email?: string | null;

  description?: string | null;
  address?: string |null;

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

          <button className="rounded-lg p-2 hover:bg-gray-100">
            <User size={22} />
          </button>

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
  className={`fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ${
    menuOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
  <div className="flex items-center justify-between border-b p-5">
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

  <nav className="space-y-2 p-4">

    <Link
  href={storeHref}
  onClick={() => setMenuOpen(false)}
  className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-gray-100"
>
      <Home size={20} />
      Home
    </Link>

    <Link
      href="/cart"
      onClick={() => setMenuOpen(false)}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-gray-100"
    >
      <ShoppingCart size={20} />
      Cart
    </Link>

    <button
      onClick={() => {
        setShowSearch(true);
        setMenuOpen(false);
      }}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-100"
    >
      <Search size={20} />
      Search Products
    </button>

    <div className="my-4 border-t" />

    <button
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-100"
    >
      <Store size={20} />
      About Store
    </button>

<button
  onClick={() => {
    setMenuOpen(false);
    setContactOpen(true);
  }}
  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-100"
>
  <Phone size={20} />
  Contact Seller
</button>

    <button
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-100"
    >
      <Info size={20} />
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
