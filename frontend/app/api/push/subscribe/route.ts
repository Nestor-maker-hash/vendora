import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";
import { supabaseServer } from "@/src/lib/supabaseServer";

interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(request: Request) {
  try {
    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice(7);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: {
      subscription?: PushSubscriptionPayload;
      platform?: string;
      userAgent?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid or empty request body" },
        { status: 400 }
      );
    }

    const subscription =
      body.subscription as PushSubscriptionPayload;

    const platform =
      typeof body.platform === "string"
        ? body.platform
        : null;

    const userAgent =
      typeof body.userAgent === "string"
        ? body.userAgent
        : null;

    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { error: "Invalid push subscription" },
        { status: 400 }
      );
    }

    const {
      data: business,
      error: businessError,
    } = await supabaseServer
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (businessError) {
      console.error(
        "Failed to find business:",
        businessError
      );

      return NextResponse.json(
        { error: "Failed to find business" },
        { status: 500 }
      );
    }

    // Not every authenticated user is a merchant.
    // Super admins and other users without a business
    // should simply skip merchant push registration.
    if (!business) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "No business associated with user",
      });
    }

    const now = new Date().toISOString();

    const { error } = await supabaseServer
      .from("push_subscriptions")
      .upsert(
        {
          business_id: business.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          platform,
          user_agent: userAgent,
          is_active: true,
          last_used_at: now,
          updated_at: now,
        },
        {
          onConflict: "endpoint",
        }
      );

    if (error) {
      console.error(
        "Failed to save push subscription:",
        error
      );

      return NextResponse.json(
        { error: "Failed to save subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Push subscription error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
