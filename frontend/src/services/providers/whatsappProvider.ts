export interface WhatsAppMessage {
  to: string;
  message: string;
}

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export async function sendWhatsApp(
  data: WhatsAppMessage
) {
  if (!token || !phoneNumberId) {
    throw new Error(
      "WhatsApp configuration is missing."
    );
  }

  const to = normalizePhoneNumber(data.to);

  if (!to) {
    throw new Error("Invalid recipient phone number.");
  }

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: data.message,
        },
      }),
    }
  );

  const result = await response.json();

if (!response.ok) {
  console.error("WhatsApp API Error:", result);

  throw new Error(
    result?.error?.message ??
    "Failed to send WhatsApp message."
  );
}

  return result;
}
export interface WhatsAppTemplateMessage {
  to: string;
  template: string;
  variables: string[];
  buttonVariables?: string[];
}

export async function sendWhatsAppTemplate(
  data: WhatsAppTemplateMessage
) {
  if (!token || !phoneNumberId) {
    throw new Error(
      "WhatsApp configuration is missing."
    );
  }

  const to = normalizePhoneNumber(data.to);

  if (!to) {
    throw new Error("Invalid recipient phone number.");
  }

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: data.template,
          language: {
            code: "en_US",
          },
         components: [
  {
    type: "body",
    parameters: data.variables.map((value) => ({
      type: "text",
      text: value,
    })),
  },

  ...(data.buttonVariables
    ? [
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: data.buttonVariables.map((value) => ({
            type: "text",
            text: value,
          })),
        },
      ]
    : []),
],
        },
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error(
      "WhatsApp Template API Error:",
      result
    );

    throw new Error(
      result?.error?.message ??
      "Failed to send WhatsApp template."
    );
  }

  return result;
}
