import { NextResponse } from "next/server";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import {
  resolveBroadcastAudience,
  BroadcastAudienceRules,
} from "@/src/features/immortal/services/resolveBroadcastAudience";

export async function POST(request: Request) {
  try {
    await getImmortalAccess();

    const body = await request.json();

    const rules =
      (body.rules ?? {}) as BroadcastAudienceRules;

    const audience =
      await resolveBroadcastAudience(rules);

    return NextResponse.json({
      success: true,
      count: audience.length,
      audience,
    });
  } catch (error) {
    console.error(
      "Broadcast audience preview failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to resolve audience",
      },
      { status: 500 }
    );
  }
}
