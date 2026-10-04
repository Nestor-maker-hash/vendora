import { supabase } from "@/src/lib/supabase";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKS = 4;

export interface VisitorAnalytics {
  visitors: number;
  visits: number;
  weeklyAverage: number;
  previousWeeklyAverage: number;
}

function getPeriodStart(
  now: number,
  weeksAgo: number
) {
  return new Date(
    now - weeksAgo * WEEK_MS
  ).toISOString();
}

export async function getVisitorAnalytics(
  businessId: string
): Promise<VisitorAnalytics> {
  const now = Date.now();

  const fourWeeksAgo = getPeriodStart(
    now,
    WEEKS
  );

  const previousEightWeeksAgo = getPeriodStart(
    now,
    WEEKS * 2
  );

  const { data, error } = await supabase
    .from("visitor_events")
    .select("visitor_id, created_at")
    .eq("business_id", businessId)
    .eq("surface", "storefront")
    .gte("created_at", fourWeeksAgo);

  if (error) {
    throw error;
  }

  const events = data ?? [];

  const visitors = new Set(
    events.map((event) => event.visitor_id)
  ).size;

  const visits = events.length;

  const weeklyAverage =
    Math.round((visits / WEEKS) * 10) / 10;

  const {
    data: previousData,
    error: previousError,
  } = await supabase
    .from("visitor_events")
    .select("visitor_id, created_at")
    .eq("business_id", businessId)
    .eq("surface", "storefront")
    .gte(
      "created_at",
      previousEightWeeksAgo
    )
    .lt(
      "created_at",
      fourWeeksAgo
    );

  if (previousError) {
    throw previousError;
  }

  const previousEvents =
    previousData ?? [];

  const previousWeeklyAverage =
    Math.round(
      (previousEvents.length / WEEKS) * 10
    ) / 10;

  return {
    visitors,
    visits,
    weeklyAverage,
    previousWeeklyAverage,
  };
}
