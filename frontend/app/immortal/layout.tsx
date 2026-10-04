"use client";

import { ReactNode, useEffect, useState } from "react";
import ImmortalSidebar from "@/src/features/immortal/components/ImmortalSidebar";
import ImmortalTopbar from "@/src/features/immortal/components/ImmortalTopbar";
import ImmortalBottomNav from "@/src/features/immortal/components/ImmortalBottomNav";
import { setPWAContext } from "@/src/lib/pwa-context";

interface ImmortalLayoutProps {
  children: ReactNode;
}

export default function ImmortalLayout({
  children,
}: ImmortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setPWAContext("immortal");
  }, []);

  useEffect(() => {
    setPWAContext("immortal");
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <div
          className={`fixed inset-0 z-40 bg-black/60 lg:hidden ${
            sidebarOpen ? "block" : "hidden"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <div
          className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <ImmortalSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <ImmortalTopbar
            email="Super Admin"
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />

          <main className="min-w-0 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
            {children}
          </main>

          <ImmortalBottomNav />
        </div>
      </div>
    </div>
  );
}
