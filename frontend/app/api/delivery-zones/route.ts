import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabaseServer";
import { checkSubscriptionLimit } from "@/src/features/subscriptions/services/checkSubscriptionLimit";

export async function POST(request: NextRequest) {
  try {
    const authorization =
      request.headers.get("authorization");

    const token =
      authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : null;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated.",
        },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";

    const price = Number(body.price);

    if (!location) {
      throw new Error(
        "Delivery location is required."
      );
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        "Delivery price must be a valid non-negative number."
      );
    }

    if (
      typeof body.freeDelivery !== "boolean"
    ) {
      throw new Error(
        "Delivery type is invalid."
      );
    }

    const {
      data: business,
      error: businessError,
    } = await supabaseServer
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        {
          success: false,
          message: "Business not found.",
        },
        { status: 404 }
      );
    }

    const {
      count: deliveryZoneCount,
      error: deliveryZoneCountError,
    } = await supabaseServer
      .from("delivery_zones")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id);

    if (deliveryZoneCountError) {
      throw deliveryZoneCountError;
    }

    const deliveryZoneLimit =
      await checkSubscriptionLimit(
        business.id,
        "max_delivery_zones",
        deliveryZoneCount ?? 0
      );

    if (!deliveryZoneLimit.allowed) {
      throw new Error(
        `You've reached the ${deliveryZoneLimit.planName} plan limit of ${deliveryZoneLimit.limit} delivery zones. Upgrade your plan to add more delivery zones.`
      );
    }

    const { data: zone, error } =
      await supabaseServer
        .from("delivery_zones")
        .insert({
          business_id: business.id,
          location,
          price,
          free_delivery:
            body.freeDelivery,
        })
        .select("*")
        .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error(
          "A delivery zone with this location already exists."
        );
      }

      throw error;
    }

    return NextResponse.json({
      success: true,
      zone,
    });
  } catch (error) {
    console.error(
      "Create delivery zone error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create delivery zone.",
      },
      { status: 400 }
    );
  }
}
