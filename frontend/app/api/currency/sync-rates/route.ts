import { NextRequest, NextResponse } from "next/server";

import { syncExchangeRates } from "@/src/features/currency/services/syncExchangeRates.server";

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get("authorization");

    const cronSecret =
      process.env.CRON_SECRET;

    if (!cronSecret) {
      throw new Error(
        "CRON_SECRET is not configured."
      );
    }

    if (
      authorization !==
      `Bearer ${cronSecret}`
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const rates =
      await syncExchangeRates();

    return NextResponse.json({
      success: true,
      rates,
    });
  } catch (error) {
    console.error(
      "Currency exchange rate sync error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to sync exchange rates.",
      },
      { status: 500 }
    );
  }
}
