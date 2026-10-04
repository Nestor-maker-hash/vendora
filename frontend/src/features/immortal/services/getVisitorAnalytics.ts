import { supabaseServer } from "@/src/lib/supabaseServer";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKS = 4;

export interface PlatformVisitorAnalytics {
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

export async function getVisitorAnalytics(): Promise<PlatformVisitorAnalytics> {
  const now = Date.now();

  const fourWeeksAgo = getPeriodStart(
    now,
    WEEKS
  );

  const eightWeeksAgo = getPeriodStart(
    now,
    WEEKS * 2
  );

  const { data, error } =
    await supabaseServer
      .from("visitor_events")
      .select("visitor_id, created_at")
      .eq("surface", "marketplace")
      .gte("created_at", fourWeeksAgo);

  if (error) {
    throw new Error(
      `Failed to load visitor analytics: ${error.message}`
    );
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
  } = await supabaseServer
    .from("visitor_events")
    .select("visitor_id, created_at")
    .eq("surface", "marketplace")
    .gte("created_at", eightWeeksAgo)
    .lt("created_at", fourWeeksAgo);

  if (previousError) {
    throw new Error(
      `Failed to load previous visitor analytics: ${previousError.message}`
    );
  }

  const previousWeeklyAverage =
    Math.round(
      ((previousData ?? []).length / WEEKS) * 10
    ) / 10;

  return {
    visitors,
    visits,
    weeklyAverage,
    previousWeeklyAverage,
  };
}
