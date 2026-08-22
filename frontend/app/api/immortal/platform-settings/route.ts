import { NextResponse } from "next/server";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { supabaseServer } from "@/src/lib/supabaseServer";

interface UpdatePlatformSettingsBody {
  lock_over_limit_products?: boolean;
}

export async function PATCH(request: Request) {
  try {
    await getImmortalAccess();

    const body =
      (await request.json()) as UpdatePlatformSettingsBody;

    if (
      body.lock_over_limit_products === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "No platform setting changes provided.",
        },
        { status: 400 }
      );
    }

    const { data: existingSettings, error: findError } =
      await supabaseServer
        .from("platform_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!existingSettings) {
      return NextResponse.json(
        {
          success: false,
          error: "Platform settings not found.",
        },
        { status: 404 }
      );
    }

    const { data: settings, error } =
      await supabaseServer
        .from("platform_settings")
        .update({
          lock_over_limit_products:
            Boolean(body.lock_over_limit_products),
        })
        .eq("id", existingSettings.id)
        .select("lock_over_limit_products")
        .single();

    if (error || !settings) {
      throw new Error(
        error?.message ??
          "Failed to update platform settings."
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "IMMORTAL PLATFORM SETTINGS UPDATE:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update platform settings.",
      },
      { status: 500 }
    );
  }
}
