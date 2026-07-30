"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useBusiness } from "@/src/features/business/hooks/useBusiness";

import { getNotificationSettings } from "../services/getNotificationSettings";
import { updateNotificationSettings } from "../services/updateNotificationSettings";

export default function NotificationSettings() {
  const { business, loading } = useBusiness();

  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    whatsapp_orders: true,
    email_orders: true,
    browser_notifications: true,
    low_stock_alerts: true,
    daily_sales_summary: false,
  });

  useEffect(() => {
    async function loadSettings() {
      if (!business) return;

      try {
        const data = await getNotificationSettings(
          business.id
        );

        if (data) {
          setSettings(data);
        }
      } catch {
        // First time merchant. Defaults remain.
      }
    }

    loadSettings();
  }, [business]);

  async function handleSave() {
    if (!business) return;

    try {
      setSaving(true);

      await updateNotificationSettings({
        business_id: business.id,
        ...settings,
      });

      toast.success("Notification settings updated.");
    } catch (err) {
      console.error(err);

      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-2xl font-bold">
        Notification Settings
      </h2>

      <div className="space-y-4">

        <Toggle
          label="WhatsApp Order Alerts"
          description="Receive a WhatsApp alert whenever a customer places an order."
          value={settings.whatsapp_orders}
          onChange={(value) =>
            setSettings({
              ...settings,
              whatsapp_orders: value,
            })
          }
        />

        <Toggle
          label="Email Order Alerts"
          description="Receive order notifications by email."
          value={settings.email_orders}
          onChange={(value) =>
            setSettings({
              ...settings,
              email_orders: value,
            })
          }
        />

        <Toggle
          label="Browser Notifications"
          description="Show browser notifications while you're using Vendora."
          value={settings.browser_notifications}
          onChange={(value) =>
            setSettings({
              ...settings,
              browser_notifications: value,
            })
          }
        />

        <Toggle
          label="Low Stock Alerts"
          description="Get notified when product inventory is running low."
          value={settings.low_stock_alerts}
          onChange={(value) =>
            setSettings({
              ...settings,
              low_stock_alerts: value,
            })
          }
        />

        <Toggle
          label="Daily Sales Summary"
          description="Receive a daily summary of your sales performance."
          value={settings.daily_sales_summary}
          onChange={(value) =>
            setSettings({
              ...settings,
              daily_sales_summary: value,
            })
          }
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Notification Settings"}
        </button>

      </div>

    </div>
  );
}

interface ToggleProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: ToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-white p-4">

      <div className="pr-4">

        <h3 className="font-semibold">
          {label}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>

      </div>

     <button
  type="button"
  onClick={() => onChange(!value)}
  className={`relative h-7 w-14 rounded-full transition-colors duration-300 ${
    value
      ? "bg-emerald-600"
      : "bg-gray-300"
  }`}
>
  <span
    className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
      value
        ? "translate-x-7"
        : "translate-x-0"
    }`}
  />
</button>

    </div>
  );
}

