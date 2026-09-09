"use client";

import { usePathname } from "next/navigation";
import BuyerBottomNav from "@/src/features/buyer/components/BuyerBottomNav";

const CUSTOMER_ROUTES = [
  "/marketplace",
  "/store",
  "/cart",
  "/buyer",
];

export default function CustomerNavigation() {
  const pathname = usePathname();

  const isCustomerRoute = CUSTOMER_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (!isCustomerRoute) {
    return null;
  }

  return <BuyerBottomNav />;
}
