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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const price = Number(body.price);
    const stock = Number(body.stock);

    if (!name) {
      throw new Error("Product name is required.");
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        "Product price must be a valid non-negative number."
      );
    }

    if (
      !Number.isFinite(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      throw new Error(
        "Product stock must be a whole non-negative number."
      );
    }

    const minimumOrderQuantity =
      body.minimum_order_quantity ?? 1;

    if (
      !Number.isInteger(
        Number(minimumOrderQuantity)
      ) ||
      Number(minimumOrderQuantity) < 1
    ) {
      throw new Error(
        "Minimum order quantity must be a whole number of at least 1."
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
      count: productCount,
      error: productCountError,
    } = await supabaseServer
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("business_id", business.id);

    if (productCountError) {
      throw productCountError;
    }

    const productLimit =
      await checkSubscriptionLimit(
        business.id,
        "max_products",
        productCount ?? 0
      );

    if (!productLimit.allowed) {
      throw new Error(
        `You've reached the ${productLimit.planName} plan limit of ${productLimit.limit} products. Upgrade your plan to add more products.`
      );
    }

    const { data: product, error } =
      await supabaseServer
        .from("products")
        .insert({
          business_id: business.id,
          name,
          description:
            typeof body.description === "string"
              ? body.description
              : null,
          price,
          merchant_price: price,
          stock,
          minimum_order_quantity:
            Number(minimumOrderQuantity),
          image_url:
            typeof body.image_url === "string"
              ? body.image_url
              : null,
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create product.",
      },
      { status: 400 }
    );
  }
}
