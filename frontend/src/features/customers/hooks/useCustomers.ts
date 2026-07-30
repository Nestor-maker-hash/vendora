"use client";

import { useEffect, useState } from "react";
import { Customer } from "../types/customer";
import { getCustomers } from "../services/getCustomers";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    customers,
    loading,
  };
}
