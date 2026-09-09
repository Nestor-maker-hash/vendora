import { NextRequest, NextResponse } from "next/server";

import { supabaseServer } from "@/src/lib/supabaseServer";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";

interface RequestBody {
  businessId?: string;
  bankCode?: string;
  accountNumber?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;

    const businessId =
      String(body.businessId ?? "").trim();

    const bankCode =
      String(body.bankCode ?? "").trim();

    const accountNumber =
      String(body.accountNumber ?? "").trim();

    if (!businessId || !bankCode || !accountNumber) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Business, bank and account number are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6,20}$/.test(accountNumber)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid account number.",
        },
        { status: 400 }
      );
    }

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

    const {
      data: business,
      error: businessError,
    } = await supabaseServer
      .from("businesses")
      .select(`
        id,
        owner_id,
        name,
        email,
        phone,
        paystack_connected,
        paystack_subaccount_code,
        paystack_transfer_recipient_code
      `)
      .eq("id", businessId)
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

    if (business.owner_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You do not have permission to connect this business.",
        },
        { status: 403 }
      );
    }

    const paystackSecretKey =
      process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      throw new Error(
        "Paystack secret key is not configured."
      );
    }

    /*
     * Load Vendora's configurable merchant fee.
     *
     * This value is controlled by the platform payment
     * settings and is never hard-coded in this route.
     */
    const {
      data: paymentSettings,
      error: paymentSettingsError,
    } = await supabaseServer
      .from("platform_payment_settings")
      .select("merchant_fee_percentage")
      .limit(1)
      .maybeSingle();

    if (paymentSettingsError) {
      throw paymentSettingsError;
    }

    if (!paymentSettings) {
      throw new Error(
        "Platform payment settings are not configured."
      );
    }

    const merchantFeePercentage =
      Number(
        paymentSettings.merchant_fee_percentage
      );

    if (
      !Number.isFinite(merchantFeePercentage) ||
      merchantFeePercentage < 0 ||
      merchantFeePercentage > 100
    ) {
      throw new Error(
        "Invalid platform merchant fee configuration."
      );
    }

    /*
     * Create a Paystack transfer recipient for the merchant's
     * connected bank account.
     *
     * Vendora will use this recipient later when releasing
     * merchant funds after successful delivery confirmation.
     */
    const createTransferRecipient = async () => {
      const recipientResponse = await fetch(
        "https://api.paystack.co/transferrecipient",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            type: "nuban",
            name: business.name,
            account_number: accountNumber,
            bank_code: bankCode,
            currency: "NGN",
          }),
        }
      );

      const recipientResult =
        await recipientResponse.json();

      if (
        !recipientResponse.ok ||
        !recipientResult.status
      ) {
        throw new Error(
          recipientResult.message ??
            "Failed to create Paystack transfer recipient."
        );
      }

      const recipientCode =
        String(
          recipientResult.data?.recipient_code ?? ""
        ).trim();

      if (!recipientCode) {
        throw new Error(
          "Paystack did not return a transfer recipient code."
        );
      }

      return recipientCode;
    };

    /*
     * If this business already has a Paystack subaccount,
     * try to update it instead of creating another one.
     *
     * The database can contain a stale subaccount code if the
     * Paystack subaccount was deleted or no longer exists on
     * the current Paystack integration.
     *
     * If Paystack returns "Subaccount not found", treat the
     * stored code as stale and continue into the create flow.
     */
    if (
      business.paystack_connected &&
      business.paystack_subaccount_code
    ) {
      const updateResponse = await fetch(
        `https://api.paystack.co/subaccount/${encodeURIComponent(
          business.paystack_subaccount_code
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            business_name: business.name,
            bank_code: bankCode,
            account_number: accountNumber,
            percentage_charge:
              merchantFeePercentage,
            primary_contact_email:
              user.email ??
              business.email ??
              undefined,
            primary_contact_name:
              business.name,
            primary_contact_phone:
              business.phone ??
              undefined,
          }),
        }
      );

      const updateResult =
        await updateResponse.json();

      /*
       * Existing subaccount is valid.
       */
      if (
        updateResponse.ok &&
        updateResult.status
      ) {
        const updatedSubaccount =
          updateResult.data;

        const transferRecipientCode =
          await createTransferRecipient();

        const { error: saveError } =
          await supabaseServer
            .from("businesses")
            .update({
              paystack_bank_code: bankCode,
              paystack_transfer_recipient_code:
                transferRecipientCode,
              paystack_connected: true,
              paystack_connected_at:
                new Date().toISOString(),
            })
            .eq("id", business.id)
            .eq("owner_id", user.id);

        if (saveError) {
          throw saveError;
        }

        return NextResponse.json({
          success: true,
          created: false,
          subaccountCode:
            updatedSubaccount?.subaccount_code ??
            business.paystack_subaccount_code,
        });
      }

      /*
       * Paystack no longer knows this subaccount.
       *
       * Clear the stale local connection and allow the normal
       * create-subaccount flow below to create a replacement.
       */
      const updateMessage =
        String(
          updateResult?.message ?? ""
        )
          .trim()
          .toLowerCase();

      const subaccountNotFound =
        updateResponse.status === 404 ||
        updateMessage.includes(
          "subaccount not found"
        );

      if (!subaccountNotFound) {
        throw new Error(
          updateResult.message ??
            "Failed to update Paystack subaccount."
        );
      }

      console.warn(
        "Paystack subaccount is stale. Creating a replacement."
      );

      const {
        error: clearStaleConnectionError,
      } = await supabaseServer
        .from("businesses")
        .update({
          paystack_subaccount_code: null,
          paystack_connected: false,
          paystack_connected_at: null,
        })
        .eq("id", business.id)
        .eq("owner_id", user.id);

      if (clearStaleConnectionError) {
        throw clearStaleConnectionError;
      }
    }

    /*
     * Create a new Paystack subaccount.
     *
     * Vendora currently keeps the full transaction amount
     * under its Paystack integration. The percentage charge
     * determines the portion retained by the main account.
     *
     * This value should be reviewed before production launch.
     */
    const createResponse = await fetch(
      "https://api.paystack.co/subaccount",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${paystackSecretKey}`,
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          business_name: business.name,
          settlement_bank: bankCode,
          account_number: accountNumber,
          percentage_charge:
            merchantFeePercentage,
          primary_contact_email:
            user.email ?? business.email ?? undefined,
          primary_contact_name:
            business.name,
          primary_contact_phone:
            business.phone ?? undefined,
        }),
      }
    );

    const createResult =
      await createResponse.json();

    if (
      !createResponse.ok ||
      !createResult.status
    ) {
      throw new Error(
        createResult.message ??
          "Failed to create Paystack subaccount."
      );
    }

    const subaccountCode =
      String(
        createResult.data?.subaccount_code ?? ""
      ).trim();

    if (!subaccountCode) {
      throw new Error(
        "Paystack did not return a subaccount code."
      );
    }

    const transferRecipientCode =
      await createTransferRecipient();

    const { error: saveError } =
      await supabaseServer
        .from("businesses")
        .update({
          paystack_subaccount_code:
            subaccountCode,
          paystack_bank_code: bankCode,
          paystack_transfer_recipient_code:
            transferRecipientCode,
          paystack_connected: true,
          paystack_connected_at:
            new Date().toISOString(),
        })
        .eq("id", business.id)
        .eq("owner_id", user.id);

    if (saveError) {
      throw saveError;
    }

    return NextResponse.json({
      success: true,
      created: true,
      subaccountCode,
    });
  } catch (error) {
    console.error(
      "Paystack connect error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect Paystack.",
      },
      { status: 500 }
    );
  }
}
