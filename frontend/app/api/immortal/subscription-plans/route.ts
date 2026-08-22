import { NextResponse } from "next/server";

import { getImmortalAccess } from "@/src/features/immortal/services/getImmortalAccess";
import { supabaseServer } from "@/src/lib/supabaseServer";

interface UpdatePlanBody {
  id?: string;
  name?: string;
  description?: string | null;
  monthly_price?: number;
  yearly_price?: number | null;

  storage_gb?: number;
  max_products?: number | null;
  max_orders_per_month?: number | null;
  max_customers?: number | null;
  max_delivery_zones?: number | null;
  max_staff?: number | null;

  custom_domain?: boolean;
  analytics?: boolean;
  priority_support?: boolean;
  api_access?: boolean;

  is_public?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export async function PATCH(request: Request) {
  try {
    await getImmortalAccess();

    const body =
      (await request.json()) as UpdatePlanBody;

    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Subscription plan ID is required.",
        },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = body.name.trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            error: "Plan name is required.",
          },
          { status: 400 }
        );
      }

      updates.name = name;
    }

    if (body.description !== undefined) {
      updates.description = body.description;
    }

    if (body.monthly_price !== undefined) {
      const monthlyPrice = Number(body.monthly_price);

      if (
        !Number.isFinite(monthlyPrice) ||
        monthlyPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Monthly price must be a valid non-negative number.",
          },
          { status: 400 }
        );
      }

      updates.monthly_price = monthlyPrice;
    }

    if (body.yearly_price !== undefined) {
      if (body.yearly_price === null) {
        updates.yearly_price = null;
      } else {
        const yearlyPrice = Number(body.yearly_price);

        if (
          !Number.isFinite(yearlyPrice) ||
          yearlyPrice < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Yearly price must be a valid non-negative number.",
            },
            { status: 400 }
          );
        }

        updates.yearly_price = yearlyPrice;
      }
    }

    if (body.max_products !== undefined) {
      if (body.max_products === null) {
        updates.max_products = null;
      } else {
        const maxProducts = Number(body.max_products);

        if (
          !Number.isInteger(maxProducts) ||
          maxProducts < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Product limit must be a non-negative whole number.",
            },
            { status: 400 }
          );
        }

        updates.max_products = maxProducts;
      }
    }

    const nullableLimitFields = [
      "max_products",
      "max_orders_per_month",
      "max_customers",
      "max_delivery_zones",
      "max_staff",
    ] as const;

    for (const field of nullableLimitFields) {
      const value = body[field];

      if (value === undefined) {
        continue;
      }

      if (value === null) {
        updates[field] = null;
        continue;
      }

      const limit = Number(value);

      if (
        !Number.isInteger(limit) ||
        limit < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} must be a non-negative whole number.`,
          },
          { status: 400 }
        );
      }

      updates[field] = limit;
    }

    if (body.storage_gb !== undefined) {
      const storageGb = Number(body.storage_gb);

      if (
        !Number.isFinite(storageGb) ||
        storageGb < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Storage must be a non-negative number.",
          },
          { status: 400 }
        );
      }

      updates.storage_gb = storageGb;
    }

    if (body.custom_domain !== undefined) {
      updates.custom_domain =
        Boolean(body.custom_domain);
    }

    if (body.analytics !== undefined) {
      updates.analytics =
        Boolean(body.analytics);
    }

    if (body.priority_support !== undefined) {
      updates.priority_support =
        Boolean(body.priority_support);
    }

    if (body.api_access !== undefined) {
      updates.api_access =
        Boolean(body.api_access);
    }

    if (body.sort_order !== undefined) {
      const sortOrder =
        Number(body.sort_order);

      if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Sort order must be a non-negative whole number.",
          },
          { status: 400 }
        );
      }

      updates.sort_order = sortOrder;
    }

    if (body.is_public !== undefined) {
      updates.is_public = Boolean(body.is_public);
    }

    if (body.is_active !== undefined) {
      updates.is_active = Boolean(body.is_active);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No changes provided.",
        },
        { status: 400 }
      );
    }

    const { data: plan, error } =
      await supabaseServer
        .from("subscription_plans")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

    if (error || !plan) {
      throw new Error(
        error?.message ??
          "Failed to update subscription plan."
      );
    }

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error(
      "IMMORTAL SUBSCRIPTION PLAN UPDATE:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update subscription plan.",
      },
      { status: 500 }
    );
  }
}
