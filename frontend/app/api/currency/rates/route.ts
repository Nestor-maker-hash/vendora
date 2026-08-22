import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { supabaseServer } from "@/src/lib/supabaseServer";

const BASE_CURRENCY = "NGN";

const SUPPORTED_CURRENCIES = [
  "NGN",
  "USD",
  "GHS",
  "KES",
] as const;

export async function GET(
  request: NextRequest
) {
  try {
    const supabaseAuth =
      await createSupabaseServerAuthClient();

    const {
      data: { user },
      error: authError,
    } =
      await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const currencyParam =
      request.nextUrl.searchParams.get(
        "currency"
      );

    const currency =
      (currencyParam ?? BASE_CURRENCY).toUpperCase();

    if (
      !SUPPORTED_CURRENCIES.includes(
        currency as
          (typeof SUPPORTED_CURRENCIES)[number]
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported currency: ${currency}`,
        },
        { status: 400 }
      );
    }

    if (currency === BASE_CURRENCY) {
      return NextResponse.json({
        success: true,
        rate: 1,
        baseCurrency: BASE_CURRENCY,
        quoteCurrency: BASE_CURRENCY,
        source: "canonical",
      });
    }

    const {
      data,
      error,
    } = await supabaseServer
      .from("currency_exchange_rates")
      .select(`
        base_currency,
        quote_currency,
        rate,
        source,
        fetched_at,
        expires_at
      `)
      .eq("base_currency", BASE_CURRENCY)
      .eq("quote_currency", currency)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Exchange rate for ${BASE_CURRENCY}/${currency} is unavailable.`,
        },
        { status: 503 }
      );
    }

    const expiresAt =
      new Date(data.expires_at);

    if (
      !Number.isFinite(
        expiresAt.getTime()
      ) ||
      expiresAt <= new Date()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Exchange rate for ${BASE_CURRENCY}/${currency} has expired.`,
        },
        { status: 503 }
      );
    }

    const rate = Number(data.rate);

    if (
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid exchange rate.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      rate,
      baseCurrency:
        data.base_currency,
      quoteCurrency:
        data.quote_currency,
      source: data.source,
      fetchedAt:
        data.fetched_at,
      expiresAt:
        data.expires_at,
    });
  } catch (error) {
    console.error(
      "Currency rate API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve exchange rate.",
      },
      { status: 500 }
    );
  }
}
