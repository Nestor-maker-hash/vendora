"use client";

import { SidebarProvider } from "@/src/context/SidebarContext";
import { CartProvider } from "@/src/features/cart/context/CartContext";
import { Toaster } from "react-hot-toast";
import RealtimeNotifications from "./RealtimeNotifications";
import PushNotificationProvider from "./PushNotificationProvider";
import PushNotificationBanner from "./PushNotificationBanner";
import PWAInstallPrompt from "./PWAInstallPrompt";
import CustomerNavigation from "./layout/CustomerNavigation";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <CartProvider>
	<PushNotificationProvider />
        <PushNotificationBanner />
	<RealtimeNotifications />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
          }}
        />

        {children}
        <CustomerNavigation />

      </CartProvider>
    </SidebarProvider>
  );
}
