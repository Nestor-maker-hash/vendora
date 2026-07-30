"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Business } from "../types/business";

export function useBusiness() {
const [business, setBusiness] =
  useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusiness() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      setBusiness(data as Business);
      setLoading(false);
    }

    loadBusiness();
  }, []);
const currency = business?.currency ?? "USD";
  return {
  business,
  currency,
  loading,
};
}
