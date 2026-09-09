"use client";

import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import { setPWAContext } from "@/src/lib/pwa-context";
import Sidebar from "./Sidebar";
import MerchantBottomNav from "./MerchantBottomNav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  useEffect(() => {
    setPWAContext("business");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-3 pb-24 sm:p-6 sm:pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      <MerchantBottomNav />
    </div>
  );
}
