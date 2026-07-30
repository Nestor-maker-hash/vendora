"use client";

import { useEffect, useState } from "react";
import { getNotifications } from "../services/getNotifications";
import { Notification } from "../types/notification";

export function useNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    notifications,
    loading,
  };
}
