import { NextRequest, NextResponse } from "next/server";

import { getProductById } from "@/src/features/products/services/getProductById";
import { getBusinessByIdServer } from "@/src/features/business/services/getBusinessByIdServer";
import { notifyLowStock } from "@/src/features/notifications/services/notifyLowStock";

export async function POST(
  request: NextRequest
) {
  try {
    const { productId, stock } =
      await request.json();

    if (!productId || typeof stock !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid low-stock notification data.",
        },
        { status: 400 }
      );
    }

    const product =
      await getProductById(productId);

    const business =
      await getBusinessByIdServer(
        product.business_id
      );

    await notifyLowStock(
      business.id,
      business.name,
      product.name,
      stock,
      product.id
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Low-stock notification failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
