"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/src/context/SidebarContext";

export default function Navbar() {
  const { open, setOpen } = useSidebar();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <h1 className="text-2xl font-bold text-emerald-600">
          Vendora
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg border px-4 py-2">
          Notifications
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
          N
        </div>
      </div>
    </header>
  );
}
