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
  Settings,
  LogOut,
} from "lucide-react";
import { useSidebar } from "@/src/context/SidebarContext";

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
    href: "/orders",
    icon: ShoppingCart,
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
          className="fixed inset-0 top-16 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 transform border-r bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 p-4 space-y-2">
          {links.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                pathname === href
                  ? "bg-emerald-50 text-emerald-600 font-medium"
                  : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
            >
              <Icon size={20} />
              <span>{name}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t p-4">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

