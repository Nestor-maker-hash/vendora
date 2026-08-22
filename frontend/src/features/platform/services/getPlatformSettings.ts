import { supabaseServer } from "@/src/lib/supabaseServer";

export interface PlatformSettings {
  lock_over_limit_products: boolean;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabaseServer
    .from("platform_settings")
    .select("lock_over_limit_products")
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ??
        "Failed to load platform settings."
    );
  }

  return data;
}
