"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import PushNotificationBanner from "@/src/components/PushNotificationBanner";

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
        const data = await getNotificationSettings(business.id);

        if (data) {
          setSettings(data);
        }
      } catch {
        // First-time merchant. Defaults remain.
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
    return (
      <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
        <div className="h-6 w-44 animate-pulse rounded bg-gray-200" />

        <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl border p-3 sm:p-4"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-40 max-w-full animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-64 max-w-full animate-pulse rounded bg-gray-100" />
              </div>

              <div className="ml-3 h-7 w-14 shrink-0 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}

          <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <h2 className="mb-5 text-lg font-semibold sm:mb-6 sm:text-xl">
        Notification Settings
      </h2>

      <div className="min-w-0 space-y-5 sm:space-y-6">
        <PushNotificationBanner />

        <div className="space-y-3 sm:space-y-4">
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
            className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 sm:mt-6 sm:px-6 sm:py-3 sm:text-base"
          >
            {saving
              ? "Saving..."
              : "Save Notification Settings"}
          </button>
        </div>
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
    <div className="flex min-w-0 items-start justify-between gap-3 rounded-xl border bg-white p-3 sm:items-center sm:gap-4 sm:rounded-2xl sm:p-4">
      <div className="min-w-0 flex-1 pr-1 sm:pr-4">
        <h3 className="text-sm font-semibold sm:text-base">
          {label}
        </h3>

        <p className="mt-1 break-words text-xs text-gray-500 sm:text-sm">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative h-6 w-12 shrink-0 rounded-full sm:h-7 sm:w-14 transition-colors duration-300 ${
          value
            ? "bg-emerald-600"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
            value
              ? "translate-x-6 sm:translate-x-7"
              : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
