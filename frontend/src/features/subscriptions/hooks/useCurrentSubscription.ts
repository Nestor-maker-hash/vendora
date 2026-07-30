"use client";

import { useEffect, useState } from "react";
import { useBusiness } from "@/src/features/business/hooks/useBusiness";
import { getCurrentSubscription } from "../services/getCurrentSubscription";
import { BusinessSubscription } from "../types/subscription";

export function useCurrentSubscription() {
  const { business } = useBusiness();

  const [subscription, setSubscription] =
    useState<BusinessSubscription | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!business) {
        setLoading(false);
        return;
      }

      const data = await getCurrentSubscription(
        business.id
      );

      setSubscription(data);
      setLoading(false);
    }

    load();
  }, [business]);

  return {
    subscription,
    loading,
  };
}
