"use client";

import { useEffect, useState } from "react";

import { useBusiness } from "@/src/features/business/hooks/useBusiness";

import { getPlans } from "../services/getPlans";
import { getCurrentSubscription } from "../services/getCurrentSubscription";

import {
  SubscriptionPlan,
  BusinessSubscription,
} from "../types/subscription";

export function useSubscription() {
  const { business, currency } = useBusiness();

  const [plans, setPlans] = useState<
    SubscriptionPlan[]
  >([]);

  const [subscription, setSubscription] =
    useState<BusinessSubscription | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!business) {
        setLoading(false);
        return;
      }

      try {
        const [plansData, subscriptionData] =
          await Promise.all([
            getPlans(),
            getCurrentSubscription(
              business.id
            ),
          ]);

        setPlans(plansData ?? []);
        setSubscription(subscriptionData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [business]);

  return {
    plans,
    subscription,
    business,
    currency,
    loading,
  };
}
