"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const section = searchParams.get("section");

  const initialSection =
    section && sectionMap[section]
      ? sectionMap[section]
      : "Storefront";

  const [current, setCurrent] = useState(initialSection);

  function handleSectionChange(nextSection: string) {
    setCurrent(nextSection);

    const key = Object.entries(sectionMap).find(
      ([, label]) => label === nextSection
    )?.[0];

    if (key) {
      router.replace(`${pathname}?section=${key}`, {
        scroll: false,
      });
    }
  }

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
    <div className="grid min-w-0 gap-3 sm:gap-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[280px_1fr]">
      <SettingsSidebar
        current={current}
        onChange={handleSectionChange}
      />

      <div className="min-w-0">
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
