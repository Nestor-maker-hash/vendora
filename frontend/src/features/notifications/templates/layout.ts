interface WhatsAppLayoutData {
  title: string;
  body: string;
  action?: string;
}

export function whatsappLayout({
  title,
  body,
  action,
}: WhatsAppLayoutData) {
  return `━━━━━━━━━━━━━━━━━━━━

${title}

━━━━━━━━━━━━━━━━━━━━

${body}

${
  action
    ? `📌 Next Step

${action}

`
    : ""
}━━━━━━━━━━━━━━━━━━━━

Powered by *Vendora*`;
}
