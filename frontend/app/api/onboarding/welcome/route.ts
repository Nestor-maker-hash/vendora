import { NextRequest, NextResponse } from "next/server";

import { getUserByIdServer } from "@/src/features/auth/services/getUserByIdServer";
import { getBusinessByIdServer } from "@/src/features/business/services/getBusinessByIdServer";
import { notifyWelcome } from "@/src/features/notifications/services/notifyWelcome";

export async function POST(
  request: NextRequest
) {
  try {
    const { businessId } =
      await request.json();

    const business =
      await getBusinessByIdServer(
        businessId
      );

    const user =
      await getUserByIdServer(
        business.owner_id
      );

    await notifyWelcome(
      business.id,
      business.name,
      user.user_metadata.full_name ??
        "Merchant"
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send welcome notification.",
      },
      {
        status: 500,
      }
    );
  }
}

