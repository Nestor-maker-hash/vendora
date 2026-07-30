"use client";

import { useEffect } from "react";
import { supabase } from "@/src/lib/supabase";
import toast from "react-hot-toast";

export default function RealtimeNotifications() {
useEffect(() => {
  console.log("Realtime Notifications Started");

  const channel = supabase
    .channel("merchant-notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        console.log("NEW NOTIFICATION:", payload);

        const notification = payload.new as {
          title: string;
          message: string;
        };

        toast.success(notification.title, {
          duration: 5000,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  return null;
}
