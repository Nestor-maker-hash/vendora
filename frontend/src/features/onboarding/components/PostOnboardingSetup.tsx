"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronRight,
  CreditCard,
  Package,
  Truck,
} from "lucide-react";

import {
  getPostOnboardingStatus,
} from "../services/getPostOnboardingStatus";

interface SetupStatus {
  productReady: boolean;
  paymentReady: boolean;
  deliveryReady: boolean;
}

export default function PostOnboardingSetup() {
  const [status, setStatus] =
    useState<SetupStatus | null>(null);

  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    try {
      const data =
        await getPostOnboardingStatus();

      setStatus({
        productReady: data.productReady,
        paymentReady: data.paymentReady,
        deliveryReady: data.deliveryReady,
      });
    } catch (error) {
      console.error(
        "Failed to load post-onboarding setup:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  if (loading || !status) {
    return null;
  }

  const completedCount = [
    status.productReady,
    status.paymentReady,
    status.deliveryReady,
  ].filter(Boolean).length;

  if (completedCount === 3) {
    return null;
  }

  return (
    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Almost there
          </p>

          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            Set up your store
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Complete these steps before your store is ready
            to receive orders.
          </p>
        </div>

        <span className="text-sm text-gray-500">
          {completedCount}/3 complete
        </span>
      </div>

      <div className="mt-6 space-y-3">
        <SetupItem
          completed={status.productReady}
          icon={Package}
          title="Add your first product"
          description="Add something customers can buy from your store."
          href="/products/new"
        />

        <SetupItem
          completed={status.paymentReady}
          icon={CreditCard}
          title="Set up payment methods"
          description="Choose how customers can pay for their orders."
          href="/settings?section=payments"
        />

        <SetupItem
          completed={status.deliveryReady}
          icon={Truck}
          title="Configure delivery"
          description="Add at least one location where you deliver."
          href="/settings?section=delivery"
        />
      </div>
    </section>
  );
}

interface SetupItemProps {
  completed: boolean;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  title: string;
  description: string;
  href: string;
}

function SetupItem({
  completed,
  icon: Icon,
  title,
  description,
  href,
}: SetupItemProps) {
  if (completed) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Check size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">
            {title}
          </p>

          <p className="text-sm text-emerald-700">
            Completed
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-600">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <ChevronRight
        size={20}
        className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
      />
    </Link>
  );
}
