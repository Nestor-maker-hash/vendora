"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
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

interface SetupStep {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  title: string;
  description: string;
  href: string;
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
    status.deliveryReady,
    status.paymentReady,
  ].filter(Boolean).length;

  if (completedCount === 3) {
    return null;
  }

  let currentStep: SetupStep;

  if (!status.productReady) {
    currentStep = {
      icon: Package,
      title: "Add your first product",
      description:
        "Give customers something to buy.",
      href: "/products/new?setup=true",
    };
  } else if (!status.deliveryReady) {
    currentStep = {
      icon: Truck,
      title: "Set up delivery",
      description:
        "Choose where you deliver.",
      href: "/settings?section=delivery&setup=true",
    };
  } else {
    currentStep = {
      icon: CreditCard,
      title: "Set up payments",
      description:
        "Choose how customers pay.",
      href: "/settings?section=payments&setup=true",
    };
  }

  const Icon = currentStep.icon;

  return (
    <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            {completedCount === 0
              ? "Get your store ready"
              : "Next step"}
          </p>

          <h2 className="mt-1 text-xl font-semibold text-gray-900">
            Set up your store
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Complete these steps to get your store ready
            to receive orders.
          </p>
        </div>

        <span className="text-sm text-gray-500">
          {completedCount}/3 complete
        </span>
      </div>

      <div className="mt-6">
        <Link
          href={currentStep.href}
          className="group flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Icon size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900">
              {currentStep.title}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {currentStep.description}
            </p>
          </div>

          <ChevronRight
            size={20}
            className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
          />
        </Link>
      </div>
    </section>
  );
}
