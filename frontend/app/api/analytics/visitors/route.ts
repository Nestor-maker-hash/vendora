import { NextResponse } from "next/server";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { supabaseServer } from "@/src/lib/supabaseServer";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKS = 4;

export async function GET() {
  try {
    const supabaseAuth =
      await createSupabaseServerAuthClient();

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated." },
        { status: 401 }
      );
    }

    const { data: business, error: businessError } =
      await supabaseServer
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Business not found." },
        { status: 404 }
      );
    }

    const now = Date.now();
    const fourWeeksAgo = new Date(
      now - WEEKS * WEEK_MS
    ).toISOString();
    const previousEightWeeksAgo = new Date(
      now - WEEKS * 2 * WEEK_MS
    ).toISOString();

    const { data: events, error: visitorError } =
      await supabaseServer
        .from("visitor_events")
        .select("visitor_id")
        .eq("business_id", business.id)
        .eq("surface", "storefront")
        .gte("created_at", fourWeeksAgo);

    if (visitorError) {
      console.error(
        "Failed to load visitor analytics:",
        visitorError
      );

      return NextResponse.json(
        { error: "Failed to load visitor analytics." },
        { status: 500 }
      );
    }

    const { data: previousEvents, error: previousError } =
      await supabaseServer
        .from("visitor_events")
        .select("visitor_id")
        .eq("business_id", business.id)
        .eq("surface", "storefront")
        .gte("created_at", previousEightWeeksAgo)
        .lt("created_at", fourWeeksAgo);

    if (previousError) {
      console.error(
        "Failed to load previous visitor analytics:",
        previousError
      );

      return NextResponse.json(
        { error: "Failed to load visitor analytics." },
        { status: 500 }
      );
    }

    const currentEvents = events ?? [];
    const priorEvents = previousEvents ?? [];

    return NextResponse.json({
      visitors: new Set(
        currentEvents.map(
          (event) => event.visitor_id
        )
      ).size,
      visits: currentEvents.length,
      weeklyAverage:
        Math.round(
          (currentEvents.length / WEEKS) * 10
        ) / 10,
      previousWeeklyAverage:
        Math.round(
          (priorEvents.length / WEEKS) * 10
        ) / 10,
    });
  } catch (error) {
    console.error(
      "Visitor analytics API error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load visitor analytics." },
      { status: 500 }
    );
  }
}
