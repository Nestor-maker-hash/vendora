import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalDevices() {
  const [devicesResult, businessesResult] =
    await Promise.all([
      supabaseServer
        .from("push_subscriptions")
        .select(
          "id, business_id, endpoint, platform, user_agent, is_active, last_used_at, created_at, updated_at"
        )
        .order("last_used_at", {
          ascending: false,
          nullsFirst: false,
        }),

      supabaseServer
        .from("businesses")
        .select("id, name, slug"),
    ]);

  if (devicesResult.error) {
    throw new Error(
      `Failed to load platform devices: ${devicesResult.error.message}`
    );
  }

  if (businessesResult.error) {
    throw new Error(
      `Failed to load device merchants: ${businessesResult.error.message}`
    );
  }

  const businessMap = new Map(
    (businessesResult.data ?? []).map((business) => [
      business.id,
      business,
    ])
  );

  return (devicesResult.data ?? []).map((device) => ({
    ...device,
    business:
      businessMap.get(device.business_id) ?? null,
  }));
}
