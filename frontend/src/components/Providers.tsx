"use client";

import { SidebarProvider } from "@/src/context/SidebarContext";
import { CartProvider } from "@/src/features/cart/context/CartContext";
import { Toaster } from "react-hot-toast";
import RealtimeNotifications from "./RealtimeNotifications";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <CartProvider>
	<RealtimeNotifications />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
          }}
        />

        {children}

      </CartProvider>
    </SidebarProvider>
  );
}
