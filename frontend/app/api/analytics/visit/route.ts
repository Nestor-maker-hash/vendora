import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";

const VISITOR_ID_PATTERN =
  /^[a-zA-Z0-9_-]{16,128}$/;

const ALLOWED_SURFACES = [
  "storefront",
  "marketplace",
] as const;

type Surface = (typeof ALLOWED_SURFACES)[number];

interface VisitPayload {
  visitorId?: unknown;
  surface?: unknown;
  businessId?: unknown;
  path?: unknown;
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as VisitPayload;

    const visitorId =
      typeof body.visitorId === "string"
        ? body.visitorId
        : "";

    const surface =
      typeof body.surface === "string"
        ? body.surface
        : "";

    const businessId =
      typeof body.businessId === "string"
        ? body.businessId
        : null;

    const path =
      typeof body.path === "string"
        ? body.path.slice(0, 500)
        : null;

    if (!VISITOR_ID_PATTERN.test(visitorId)) {
      return NextResponse.json(
        { error: "Invalid visitor ID." },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_SURFACES.includes(
        surface as Surface
      )
    ) {
      return NextResponse.json(
        { error: "Invalid analytics surface." },
        { status: 400 }
      );
    }

    if (
      surface === "storefront" &&
      !businessId
    ) {
      return NextResponse.json(
        {
          error:
            "A business ID is required for storefront visits.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("visitor_events")
      .insert({
        visitor_id: visitorId,
        surface,
        business_id:
          surface === "storefront"
            ? businessId
            : null,
        path,
      });

    if (error) {
      console.error(
        "Failed to record visitor event:",
        error
      );

      return NextResponse.json(
        { error: "Failed to record visit." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Visitor analytics request failed:",
      error
    );

    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
