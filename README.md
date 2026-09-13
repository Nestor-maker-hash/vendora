# Vendora

**Commerce OS and marketplace for African merchants.**

Vendora helps merchants manage their storefronts, products, inventory, orders, customers, payments, notifications, and business operations from one platform.

## Vision

Help African merchants sell more, manage customers, and grow their businesses through one platform.

## Features

- Online merchant storefronts
- Product and inventory management
- Marketplace connecting buyers and sellers
- Order management
- Customer management / CRM
- Payment processing
- Merchant notifications
- Business analytics
- Delivery and order tracking foundations
- Merchant onboarding and settings
- Platform administration

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend / APIs:** Next.js server routes and services
- **Database:** PostgreSQL via Supabase
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Paystack, Flutterwave
- **Deployment:** Vercel

## Project Structure

```text
vendora/
├── frontend/   # Main Next.js application
├── backend/    # Backend-related code
├── src/        # Shared/application source
├── docs/       # Project documentation
└── README.md   # Project documentation
```

## Development

From the frontend directory:

```bash
cd frontend
npm install
npm run dev -- --webpack
```

The project uses Webpack for local development and production builds.

### Validation

```bash
cd frontend
npx tsc --noEmit
npx next build --webpack
npm audit
```

## Recovery

The repository is backed up on GitHub.

To recover the project:

```bash
git clone https://github.com/Nestor-maker-hash/vendora.git
cd vendora/frontend
npm install
```

Create the required `.env.local` values from `.env.example` before running the application.

**Never commit `.env.local`, API keys, service-role keys, payment secrets, or other credentials.**

## Status

🚧 **Under active development**

Vendora is evolving from a merchant commerce operating system into a marketplace connecting African businesses.

## Repository

Vendora is a private commercial project under active development.
