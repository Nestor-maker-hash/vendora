import { NextResponse } from "next/server";

import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";

export async function GET() {
  try {
    const supabaseAuth =
      await createSupabaseServerAuthClient();

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const paystackSecretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error(
        "Paystack secret key is not configured."
      );
    }

    const paystackBanksUrl =
      "https://api.paystack.co/bank?country=nigeria&currency=NGN&perPage=100";

    let response: Response | null = null;
    let lastError: unknown = null;

    /*
     * Paystack can occasionally have a transient connection
     * timeout from the Node/Undici runtime even when the API
     * itself is reachable. Retry once before failing.
     */
    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 15000);

      try {
        response = await fetch(paystackBanksUrl, {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,
          },
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          break;
        }

        lastError = new Error(
          `Paystack returned HTTP ${response.status}.`
        );
      } catch (error) {
        clearTimeout(timeout);
        lastError = error;

        if (attempt === 2) {
          throw error;
        }
      }
    }

    if (!response) {
      throw (
        lastError instanceof Error
          ? lastError
          : new Error(
              "Failed to connect to Paystack."
            )
      );
    }

    const result = await response.json();

    if (
      !response.ok ||
      !result.status
    ) {
      throw new Error(
        result.message ??
          "Failed to retrieve Paystack banks."
      );
    }

    const banks = Array.isArray(result.data)
      ? result.data
          .filter(
            (bank: {
              active?: boolean;
              is_deleted?: boolean;
              name?: string;
              code?: string;
            }) =>
              bank.active !== false &&
              bank.is_deleted !== true &&
              Boolean(bank.name) &&
              Boolean(bank.code)
          )
          .map(
            (bank: {
              name?: string;
              code?: string;
            }) => ({
              name: String(bank.name),
              code: String(bank.code),
            })
          )
      : [];

    return NextResponse.json({
      success: true,
      banks,
    });
  } catch (error) {
    console.error(
      "Paystack banks error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to retrieve banks.",
      },
      { status: 500 }
    );
  }
}
