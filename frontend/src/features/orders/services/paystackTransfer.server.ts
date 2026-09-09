interface PaystackTransferInput {
  amount: number;
  recipientCode: string;
  reference: string;
  reason?: string;
}

interface PaystackTransferResponse {
  status?: boolean;
  message?: string;
  data?: {
    transfer_code?: string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    recipient?: {
      recipient_code?: string;
    };
    reason?: string;
  };
}

export interface PaystackTransferVerificationResult {
  success: boolean;
  reference: string;
  transferCode: string | null;
  status: string | null;
  amount: number | null;
  currency: string | null;
  recipientCode: string | null;
  message: string | null;
}

export async function verifyPaystackTransfer(
  referenceInput: string
): Promise<PaystackTransferVerificationResult> {
  const paystackSecretKey =
    process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    throw new Error(
      "Paystack secret key is not configured."
    );
  }

  const reference =
    String(referenceInput ?? "").trim();

  if (!reference) {
    throw new Error(
      "Paystack transfer reference is required."
    );
  }

  const response = await fetch(
    `https://api.paystack.co/transfer/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${paystackSecretKey}`,
      },
    }
  );

  let result: PaystackTransferResponse;

  try {
    result =
      (await response.json()) as PaystackTransferResponse;
  } catch {
    throw new Error(
      `Paystack transfer verification failed with HTTP ${response.status}.`
    );
  }

  if (!response.ok || !result.status || !result.data) {
    throw new Error(
      result.message ??
        `Paystack transfer verification failed with HTTP ${response.status}.`
    );
  }

  const data = result.data;

  const returnedReference =
    String(data.reference ?? reference).trim();

  if (returnedReference !== reference) {
    throw new Error(
      "Paystack returned a different transfer reference."
    );
  }

  return {
    success: true,
    reference: returnedReference,
    transferCode:
      String(data.transfer_code ?? "").trim() || null,
    status:
      String(data.status ?? "").trim() || null,
    amount:
      Number.isFinite(Number(data.amount))
        ? Number(data.amount) / 100
        : null,
    currency:
      String(data.currency ?? "").trim() || null,
    recipientCode:
      String(
        data.recipient?.recipient_code ?? ""
      ).trim() || null,
    message: result.message ?? null,
  };
}

export interface PaystackTransferResult {
  success: boolean;
  transferCode: string | null;
  reference: string;
  status: string | null;
  amount: number;
}

export async function initiatePaystackTransfer(
  input: PaystackTransferInput
): Promise<PaystackTransferResult> {
  const paystackSecretKey =
    process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    throw new Error(
      "Paystack secret key is not configured."
    );
  }

  if (
    !Number.isFinite(input.amount) ||
    input.amount <= 0
  ) {
    throw new Error(
      "Invalid Paystack transfer amount."
    );
  }

  const recipientCode =
    String(input.recipientCode ?? "").trim();

  if (!recipientCode) {
    throw new Error(
      "Paystack transfer recipient code is required."
    );
  }

  const reference =
    String(input.reference ?? "").trim();

  if (!reference) {
    throw new Error(
      "Paystack transfer reference is required."
    );
  }

  /*
   * Vendora stores monetary values in naira.
   * Paystack expects NGN transfer amounts in kobo.
   */
  const amountInKobo =
    Math.round(input.amount * 100);

  if (amountInKobo <= 0) {
    throw new Error(
      "Paystack transfer amount must be greater than zero."
    );
  }

  const response = await fetch(
    "https://api.paystack.co/transfer",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${paystackSecretKey}`,
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amountInKobo,
        recipient: recipientCode,
        reference,
        reason:
          input.reason ??
          "Vendora merchant settlement",
      }),
    }
  );

  let result: PaystackTransferResponse;

  try {
    result =
      (await response.json()) as PaystackTransferResponse;
  } catch {
    throw new Error(
      `Paystack transfer request failed with HTTP ${response.status}.`
    );
  }

  if (!response.ok || !result.status) {
    throw new Error(
      result.message ??
        `Paystack transfer request failed with HTTP ${response.status}.`
    );
  }

  const transferCode =
    String(
      result.data?.transfer_code ?? ""
    ).trim() || null;

  const returnedReference =
    String(
      result.data?.reference ?? reference
    ).trim();

  const transferStatus =
    String(
      result.data?.status ?? ""
    ).trim() || null;

  return {
    success: true,
    transferCode,
    reference: returnedReference,
    status: transferStatus,
    amount: input.amount,
  };
}
