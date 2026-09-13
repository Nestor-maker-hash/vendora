# Vendora

**Commerce OS and marketplace for African merchants.**

Vendora helps merchants manage their storefront, products, inventory, orders, customers, payments, notifications, and business operations from one platform.

## 🚀 What Vendora Does

- 🏪 Online merchant storefronts
- 📦 Product and inventory management
- 🛒 Marketplace for buyers and sellers
- 📋 Order management
- 👥 Customer management / CRM
- 💳 Payment processing
- 🔔 Merchant notifications
- 📊 Business analytics
- 🚚 Delivery and order tracking foundations
- ⚙️ Merchant onboarding and settings
- 🛡️ Platform administration

## 🧱 Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Vercel
- Paystack
- Flutterwave

## 📁 Project Structure

```text
app/                 Next.js application routes
src/                 Application features, services and components
public/              Static assets
proxy.ts             Request/auth proxy
next.config.ts       Next.js configuration
package.json         Dependencies and scripts
vercel.json          Vercel configuration
```

## 💻 Requirements

- Node.js
- npm
- A Supabase project
- Required payment provider accounts for payment features

## 🔐 Environment Variables

Vendora uses environment variables for credentials and configuration.

Create a local environment file:

```bash
touch .env.local
```

The production `.env.local` file must never be committed to Git.

See the application source for the environment variables currently required.

Never publish:

- Supabase service-role keys
- Payment provider secret keys
- OAuth secrets
- Webhook secrets
- Any other private credentials

## 🛠️ Local Development

Clone the repository:

```bash
git clone https://github.com/Nestor-maker-hash/vendora.git
cd vendora
```

Install dependencies:

```bash
npm install
```

Create and configure `.env.local`, then start the development server:

```bash
npm run dev -- --webpack
```

Open:

```text
http://localhost:3000
```

## 🧪 Validation

Run TypeScript checks:

```bash
npx tsc --noEmit
```

Create a production build:

```bash
npx next build --webpack
```

## 🚀 Deployment

Vendora is designed to run on Vercel with Supabase providing the backend database and authentication infrastructure.

Production environment variables must be configured in the deployment platform rather than committed to Git.

## 🔄 Disaster Recovery

If the development device is lost or replaced, the source code can be restored from GitHub.

```bash
git clone https://github.com/Nestor-maker-hash/vendora.git
cd vendora
npm install
```

Then recreate `.env.local` using the required production/development credentials.

The Git repository preserves the committed source code and project history.

### Important

GitHub is a backup of the source code, not a backup of secrets or external services.

Supabase data, payment-provider configuration, OAuth credentials, and deployment environment variables should have their own recovery/access procedures.

## 🔒 Security

Do not commit secrets.

Before pushing changes, check:

```bash
git status
git ls-files | grep -E '(^|/)\.env' || true
```

If a secret is accidentally committed, rotate the credential immediately.

## 📌 Project Status

Vendora is actively developed.

The platform is evolving from a merchant commerce-management product toward a marketplace connecting retailers and wholesalers.

## 📄 License

Vendora is currently maintained as a private commercial project.

