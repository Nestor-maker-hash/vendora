import { NextRequest, NextResponse } from "next/server";

import { sendWhatsApp } from "@/src/services/providers/whatsappProvider";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    await sendWhatsApp({
      to: body.to,
      message: body.message,
    });

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
            : "Failed to send WhatsApp.",
      },
      {
        status: 500,
      }
    );
  }
}
