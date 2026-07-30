"use client";

import { useState } from "react";
import SettingsSidebar from "./SettingsSidebar";
import StorefrontSettings from "./StorefrontSettings";
import SecuritySettings from "./SecuritySettings";
import AnalyticsSettings from "./AnalyticsSettings";
import NotificationSettings from "./NotificationSettings";
import DangerZone from "./DangerZone";

export default function SettingsPage() {
  const [current, setCurrent] = useState("Storefront");

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

        {current === "Password & Security" && (
          <SecuritySettings />
        )}

        {current === "Analytics" && (
          <AnalyticsSettings />
        )}

        {current === "Notifications" && (
          <NotificationSettings />
        )}


        {current === "Danger Zone" && (
          <DangerZone />
        )}

      </div>

    </div>
  );
}
