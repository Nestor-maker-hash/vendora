"use client";

import { useEffect, useState } from "react";
import { getCustomerByPhone } from "../services/getCustomerByPhone";

export function useCustomer(phone: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const customer = await getCustomerByPhone(phone);
        setData(customer);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [phone]);

  return { data, loading };
}
