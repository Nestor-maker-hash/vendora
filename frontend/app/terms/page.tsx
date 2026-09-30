import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Vendora Terms of Service",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/"
          className="text-2xl font-bold text-emerald-600"
        >
          Vendora
        </Link>

        <article className="mt-10 rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Terms of Service
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            Effective Date: September 30, 2026
          </p>

          <div className="mt-10 space-y-8 text-gray-700 leading-7">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                1. About Vendora
              </h2>
              <p className="mt-3">
                Vendora is a commerce operating system and marketplace that
                provides tools for merchants to create storefronts, manage
                products and inventory, manage customers and orders,
                receive payments, communicate with customers and
                participate in marketplace discovery and transactions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                2. Acceptance of These Terms
              </h2>
              <p className="mt-3">
                By accessing or using Vendora, you agree to these Terms of
                Service and our Privacy Policy. If you do not agree with
                these Terms, you should not use Vendora.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                3. Accounts
              </h2>
              <p className="mt-3">
                You are responsible for providing accurate information,
                maintaining the security of your account credentials and
                all activity performed through your account.
              </p>
              <p className="mt-3">
                You must not use another person&apos;s account or
                intentionally provide false information to Vendora.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                4. Merchant Accounts
              </h2>
              <p className="mt-3">
                Merchants are responsible for the accuracy of their
                business information, product listings, prices, inventory,
                customer information, delivery information and other
                content they publish through Vendora.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                5. Marketplace
              </h2>
              <p className="mt-3">
                Vendora provides technology that allows buyers and
                merchants to discover and interact with products and
                businesses.
              </p>
              <p className="mt-3">
                Merchants are independent sellers and remain responsible
                for the products and services they offer. Vendora does not
                guarantee the quality, legality, availability or suitability
                of products listed by merchants.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                6. Products and Prohibited Activities
              </h2>
              <p className="mt-3">
                You may not use Vendora to sell or promote products or
                services that are illegal, fraudulent, infringing,
                deceptive or otherwise prohibited by applicable law.
              </p>
              <p className="mt-3">
                Vendora may remove listings or restrict accounts where
                necessary to protect users, comply with law or enforce
                these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                7. Orders
              </h2>
              <p className="mt-3">
                Merchants are responsible for fulfilling accepted orders,
                maintaining accurate product information and communicating
                material changes or problems to customers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                8. Payments
              </h2>
              <p className="mt-3">
                Vendora may support payment processing through third-party
                payment providers such as Paystack or Flutterwave.
                Payment processing may be subject to the provider&apos;s
                own terms and policies.
              </p>
              <p className="mt-3">
                Transaction references, payment status, amounts and related
                information may be associated with orders and merchant
                accounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                9. Merchant Subscriptions
              </h2>
              <p className="mt-3">
                Certain Vendora features may require a paid subscription.
                Subscription pricing, billing periods and available
                features may be displayed within Vendora and may change
                from time to time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                10. Notifications and Communications
              </h2>
              <p className="mt-3">
                Vendora may send service-related communications through
                email, web notifications, WhatsApp or other supported
                channels. These communications may include order updates,
                payment information, account notices, security messages
                and other service-related notifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                11. User Content
              </h2>
              <p className="mt-3">
                You retain ownership of content you provide to Vendora,
                subject to the rights necessary for Vendora to host,
                display, process and provide the services associated with
                that content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                12. Customer Information
              </h2>
              <p className="mt-3">
                Merchants are responsible for using customer information
                obtained through Vendora lawfully and only for legitimate
                business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                13. Intellectual Property
              </h2>
              <p className="mt-3">
                Vendora and its underlying software, branding, interfaces
                and technology are owned by Vendora or its licensors and
                are protected by applicable intellectual-property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                14. Third-Party Services
              </h2>
              <p className="mt-3">
                Vendora may depend on third-party services for
                authentication, payments, hosting, storage, communications
                and other functionality. Third-party services may have
                separate terms and privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                15. Availability
              </h2>
              <p className="mt-3">
                We work to keep Vendora available and reliable, but we do
                not guarantee uninterrupted or error-free operation.
                Services may occasionally be unavailable because of
                maintenance, technical problems or circumstances outside
                our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                16. Suspension and Termination
              </h2>
              <p className="mt-3">
                Vendora may suspend or terminate access where reasonably
                necessary to prevent abuse, address security risks, comply
                with legal obligations or enforce these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                17. Disclaimers
              </h2>
              <p className="mt-3">
                Vendora is provided on an as-available basis. To the
                extent permitted by law, Vendora does not guarantee that
                the service will always meet every user requirement or
                operate without interruption or errors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                18. Limitation of Liability
              </h2>
              <p className="mt-3">
                To the extent permitted by applicable law, Vendora will
                not be responsible for indirect, incidental, special or
                consequential losses arising from use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                19. Changes to These Terms
              </h2>
              <p className="mt-3">
                We may update these Terms from time to time. Continued use
                of Vendora after an updated version becomes effective may
                constitute acceptance of the updated Terms where permitted
                by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                20. Governing Law
              </h2>
              <p className="mt-3">
                These Terms are intended to be governed by the applicable
                laws of the Federal Republic of Nigeria, subject to any
                mandatory legal requirements that may apply to a particular
                user or transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                21. Contact
              </h2>
              <p className="mt-3">
                For questions about these Terms, please contact Vendora
                through the official support contact provided on our
                website.
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
