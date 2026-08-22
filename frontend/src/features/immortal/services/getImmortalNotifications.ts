import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalNotifications() {
  const [notificationsResult, businessesResult] =
    await Promise.all([
      supabaseServer
        .from("notifications")
        .select(
          "id, business_id, title, message, type, link, is_read, created_at"
        )
        .order("created_at", { ascending: false }),

      supabaseServer
        .from("businesses")
        .select("id, name, slug"),
    ]);

  if (notificationsResult.error) {
    throw new Error(
      `Failed to load platform notifications: ${notificationsResult.error.message}`
    );
  }

  if (businessesResult.error) {
    throw new Error(
      `Failed to load notification merchants: ${businessesResult.error.message}`
    );
  }

  const businesses = businessesResult.data ?? [];
  const businessMap = new Map(
    businesses.map((business) => [business.id, business])
  );

  return (notificationsResult.data ?? []).map(
    (notification) => ({
      ...notification,
      business:
        businessMap.get(notification.business_id) ?? null,
    })
  );
}
