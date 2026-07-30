"use client";

import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "../services/getUnreadNotificationCount";

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const unread = await getUnreadNotificationCount();
        setCount(unread);
      } catch (error) {
        console.error(error);
      }
    }

    load();
  }, []);

  return count;
}
