"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/src/features/cart/context/CartContext";
import StoreNavbar from "@/src/components/store/StoreNavbar";
import { createOrder } from "@/src/features/orders/services/createOrder";
import { getBusinessBySlug } from "@/src/features/business/services/getBusinessBySlug";
import { formatCurrency } from "@/src/utils/formatCurrency";

export default function CheckoutPage() {
  const {
    items,
    storeSlug,
    clearCart,
    currency,
  } = useCart();

  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = 0;

  const total = subtotal + deliveryFee;

  async function handleCheckout() {
    if (!storeSlug) {
      alert("Store information is missing.");
      return;
    }

    if (!customerName || !customerPhone || !state || !city || !address) {
      alert("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      // Temporarily log store metadata and cart items for validation
      console.log({
        storeSlug,
        businessId: items[0]?.business_id,
        items,
      });

     const order = await createOrder({
  businessId: items[0].business_id,
  customerName,
  customerPhone,
  customerEmail,
  state,
  city,
  address,
  notes,
  deliveryFee,
  items,
});

const business = await getBusinessBySlug(storeSlug);

if (business.phone) {
  const dashboardUrl =
  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}`;

const message =
`🛒 Vendora

‼️ New order from ${customerName}

View Order:
${dashboardUrl}`;

  window.open(
    `https://wa.me/${business.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

const slug = storeSlug;

clearCart();

router.push(`/order-success?store=${slug}`);


    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : JSON.stringify(error, null, 2)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StoreNavbar
        storeName="Checkout"
        storeHref={storeSlug ? `/store/${storeSlug}` : "/"}
      />

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-3">

          {/* Customer Form */}
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">

            <h1 className="mb-8 text-3xl font-semibold">
              Checkout
            </h1>

            <div className="space-y-6">

              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Contact Information
                </h2>

                <div className="grid gap-4">

                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />

                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />
                  <input
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Email (Optional)"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Delivery Address
                </h2>

                <div className="grid gap-4">

                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Order Notes (Optional)"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

            </div>

          </section>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-semibold">
              Order Summary
            </h2>

            <div className="space-y-4">

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty {item.quantity}
                    </p>
                  </div>

                  <p className="font-medium">
                   {formatCurrency(item.price * item.quantity, currency)}
                  </p>
                </div>
              ))}

            </div>

            <div className="my-6 border-t" />

            <div className="space-y-3">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
		{formatCurrency(subtotal, currency)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
		{formatCurrency(deliveryFee, currency)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>

                <span className="text-emerald-600">
		{formatCurrency(total, currency)}
                </span>
              </div>

            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="mt-8 w-full rounded-xl bg-emerald-600 py-4 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </aside>

        </div>
      </main>
    </>
  );
}

