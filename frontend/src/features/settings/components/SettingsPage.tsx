"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import SettingsSidebar from "./SettingsSidebar";
import StorefrontSettings from "./StorefrontSettings";
import SecuritySettings from "./SecuritySettings";
import AnalyticsSettings from "./AnalyticsSettings";
import NotificationSettings from "./NotificationSettings";
import DangerZone from "./DangerZone";
import DeliverySettings from "@/src/features/delivery/components/DeliverySettings";
import PaymentSettings from "./PaymentSettings";

const sectionMap: Record<string, string> = {
  storefront: "Storefront",
  payments: "Payments",
  security: "Password & Security",
  analytics: "Analytics",
  notifications: "Notifications",
  delivery: "Delivery",
  danger: "Danger Zone",
};

export default function SettingsPage() {
  const searchParams = useSearchParams();

  const section = searchParams.get("section");

  const initialSection =
    section && sectionMap[section]
      ? sectionMap[section]
      : "Storefront";

  const [current, setCurrent] = useState(initialSection);

  useEffect(() => {
    const requestedSection = searchParams.get("section");

    if (
      requestedSection &&
      sectionMap[requestedSection]
    ) {
      setCurrent(sectionMap[requestedSection]);
    }
  }, [searchParams]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <SettingsSidebar
        current={current}
        onChange={setCurrent}
      />

      <div>
        {current === "Storefront" && (
          <StorefrontSettings />
        )}

        {current === "Payments" && (
          <PaymentSettings />
        )}

        {current === "Password & Security" && (
          <SecuritySettings />
        )}

        {current === "Analytics" && (
          <AnalyticsSettings />
        )}

        {current === "Notifications" && (
          <NotificationSettings />
        )}

        {current === "Delivery" && (
          <DeliverySettings />
        )}

        {current === "Danger Zone" && (
          <DangerZone />
        )}
      </div>
    </div>
  );
}
