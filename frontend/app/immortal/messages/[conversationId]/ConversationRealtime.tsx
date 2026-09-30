"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function ConversationRealtime() {
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("immortal-whatsapp-conversation")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "immortal_whatsapp_events",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
