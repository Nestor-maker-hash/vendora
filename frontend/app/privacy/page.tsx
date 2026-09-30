import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Vendora Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6">
      <article className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          ← Back to Vendora
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Privacy Policy
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Effective date: September 30, 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Introduction
            </h2>
            <p className="mt-3">
              Vendora is a commerce operating system and marketplace that
              helps merchants manage products, inventory, customers, orders,
              payments, storefronts, notifications, analytics, and marketplace
              sales.
            </p>
            <p className="mt-3">
              This Privacy Policy explains what information we collect, how we
              use it, how it may be shared, and the choices available to users
              of Vendora.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Information We Collect
            </h2>

            <h3 className="mt-4 font-semibold text-slate-900">
              Account and authentication information
            </h3>
            <p className="mt-2">
              We may collect your name, email address, authentication
              identifiers, account information, and information associated
              with your login method, including Google authentication where
              you choose to use it.
            </p>

            <h3 className="mt-4 font-semibold text-slate-900">
              Merchant and business information
            </h3>
            <p className="mt-2">
              Merchants may provide business names, descriptions, categories,
              store names and URLs, business locations or addresses, contact
              information, social links, delivery information, subscription
              information, and other storefront settings.
            </p>

            <h3 className="mt-4 font-semibold text-slate-900">
              Products and inventory
            </h3>
            <p className="mt-2">
              We may collect product names, descriptions, images, prices,
              stock levels, categories, product identifiers, and related
              inventory information.
            </p>

            <h3 className="mt-4 font-semibold text-slate-900">
              Orders and customer information
            </h3>
            <p className="mt-2">
              We may process buyer or customer names, contact information,
              delivery information, order details, purchased products,
              quantities, amounts, order status, payment status, merchant
              information, and communications relating to an order.
            </p>

            <h3 className="mt-4 font-semibold text-slate-900">
              Payment information
            </h3>
            <p className="mt-2">
              We may process payment-related information such as transaction
              references, payment status, transaction amounts, fees, payment
              provider information, order references, and subscription billing
              information. Payment details may be processed by third-party
              payment providers such as Paystack or Flutterwave.
            </p>

            <h3 className="mt-4 font-semibold text-slate-900">
              Technical and security information
            </h3>
            <p className="mt-2">
              We may collect technical information such as IP addresses,
              browser and device information, operating system information,
              session information, request logs, error logs, and security
              information used to protect Vendora and its users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. How We Use Information
            </h2>
            <p className="mt-3">
              We may use information to:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Create and manage user accounts.</li>
              <li>Provide merchant storefronts and marketplace features.</li>
              <li>Manage products, inventory, orders, and customers.</li>
              <li>Process and verify payments.</li>
              <li>Manage subscriptions and account features.</li>
              <li>Send transactional and service notifications.</li>
              <li>Support delivery and order-related operations.</li>
              <li>Provide analytics and improve Vendora.</li>
              <li>Detect fraud, abuse, and security threats.</li>
              <li>Troubleshoot technical problems.</li>
              <li>Communicate important service information.</li>
              <li>Comply with applicable legal obligations.</li>
              <li>Enforce our Terms of Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Marketplace and Public Information
            </h2>
            <p className="mt-3">
              Information that merchants choose to publish through their
              storefronts or the Vendora marketplace may be publicly visible.
              This can include business or store names, product information,
              product images, prices, descriptions, and configured business
              information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. Sharing Information
            </h2>
            <p className="mt-3">
              We may share information with service providers that help us
              operate Vendora, including providers for hosting, databases,
              authentication, storage, payments, communications, notifications,
              analytics, security, and other infrastructure.
            </p>
            <p className="mt-3">
              We may also disclose information when reasonably necessary to
              comply with applicable law, legal process, governmental requests,
              protect users or Vendora, investigate abuse or fraud, or enforce
              our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Third-Party Services
            </h2>
            <p className="mt-3">
              Vendora may use third-party services including Supabase for
              authentication, database and storage infrastructure, Vercel for
              hosting and deployment, Paystack and Flutterwave for payment
              services, and communication or notification providers such as
              WhatsApp-related services.
            </p>
            <p className="mt-3">
              These providers may process information according to their own
              terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Merchant Customer Data
            </h2>
            <p className="mt-3">
              Merchants may enter customer information into Vendora in order
              to manage orders, customer relationships, delivery, and related
              business operations. Merchants are responsible for ensuring that
              their collection and use of customer information complies with
              applicable privacy and data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. International Processing
            </h2>
            <p className="mt-3">
              Vendora and its service providers may process or store
              information in countries other than the country where you live.
              Where required, appropriate safeguards will be used for such
              processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Data Retention
            </h2>
            <p className="mt-3">
              We retain information for as long as reasonably necessary to
              provide Vendora, maintain business and transaction records,
              resolve disputes, prevent abuse, comply with legal obligations,
              and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              10. Account Deletion
            </h2>
            <p className="mt-3">
              Users may request deletion of their Vendora account and
              associated personal information. Some information may need to be
              retained where required by law, necessary for legitimate business
              purposes, or needed to resolve disputes, prevent fraud, or
              maintain transaction records.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              11. Your Privacy Rights
            </h2>
            <p className="mt-3">
              Depending on your location and applicable law, you may have
              rights relating to access, correction, deletion, restriction,
              objection, portability, or other processing of your personal
              information.
            </p>
            <p className="mt-3">
              Requests can be made using the contact information provided
              below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              12. Cookies and Similar Technologies
            </h2>
            <p className="mt-3">
              Vendora may use cookies, local storage, sessions, and similar
              technologies to authenticate users, maintain sessions, remember
              preferences, provide functionality, and help secure the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              13. Security
            </h2>
            <p className="mt-3">
              We use reasonable technical and organizational measures designed
              to protect information against unauthorized access, alteration,
              disclosure, or destruction. However, no internet-based service
              can guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              14. Children
            </h2>
            <p className="mt-3">
              Vendora is intended for users who can legally use the service
              under applicable law. We do not knowingly collect personal
              information from children in violation of applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              15. Changes to This Policy
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. When
              material changes are made, we may provide notice through Vendora
              or other appropriate means. The effective date at the top of
              this page indicates when the current version became effective.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              16. Contact
            </h2>
            <p className="mt-3">
              For privacy questions or requests, please contact Vendora through
              the official support contact provided by Vendora.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
