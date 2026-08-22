"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/src/features/cart/context/CartContext";
import StoreNavbar from "@/src/components/store/StoreNavbar";
import { getBusinessBySlug } from "@/src/features/business/services/getBusinessBySlug";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { PaymentMethod } from "@/src/features/orders/types/order";
import { Business } from "@/src/features/business/types/business";
import type { DeliveryZone } from "@/src/features/delivery/types/deliveryZone";
import { getDeliveryZones } from "@/src/features/delivery/services/getDeliveryZones";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pay_on_delivery");
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [deliveryZoneId, setDeliveryZoneId] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  useEffect(() => {
    if (!storeSlug) return;

    async function loadBusiness() {
      try {
        const data = await getBusinessBySlug(storeSlug!);
        setBusiness(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadBusiness();
  }, [storeSlug]);

  useEffect(() => {
    if (!business?.id) return;

    const businessId: string = business.id;

    async function loadDeliveryZones() {
      try {
        setDeliveryLoading(true);

        const zones = await getDeliveryZones(businessId);

        setDeliveryZones(zones);

        if (zones.length === 1) {
          setDeliveryZoneId(zones[0].id);
        }
      } catch (error) {
        console.error("Failed to load delivery zones:", error);
      } finally {
        setDeliveryLoading(false);
      }
    }

    loadDeliveryZones();
  }, [business?.id]);



  useEffect(() => {
    if (!business) return;

    if (business.pay_on_delivery_enabled) {
      setPaymentMethod("pay_on_delivery");
      return;
    }

    if (business.bank_transfer_enabled) {
      setPaymentMethod("bank_transfer");
      return;
 0   }

    if (business.online_payment_enabled) {
      setPaymentMethod("paystack");
    }
  }, [business]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedDeliveryZone = deliveryZones.find(
  (zone) => zone.id === deliveryZoneId
);

const deliveryFee = selectedDeliveryZone
  ? selectedDeliveryZone.free_delivery
    ? 0
    : Number(selectedDeliveryZone.price)
  : 0;

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

    if (!deliveryZoneId) {
  alert("Please select a delivery area.");
  return;
}

    setLoading(true);

    try {
      console.log("CHECKOUT DELIVERY DEBUG:", {
        storeSlug,
        businessId: items[0]?.business_id,
        deliveryZoneId,
        deliveryZones: deliveryZones.map((zone) => ({
          id: zone.id,
          business_id: zone.business_id,
          location: zone.location,
        })),
        selectedDeliveryZone,
        items,
      });

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessId: items[0].business_id,
          customerName,
          customerPhone,
          customerEmail,
          state,
          city,
          address,
          notes,
          deliveryZoneId: deliveryZoneId || null,
          paymentMethod,
          items,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Failed to create order.");
      }

      const order = result.order;
      const slug = storeSlug;

      clearCart();

      if (paymentMethod === "pay_on_delivery") {
        router.push(`/order-success?store=${slug}`);
        return;
      }

      if (paymentMethod === "bank_transfer") {
	router.push(`/payment/bank-transfer?token=${order.public_token}`);
        return;
      }

      router.push(`/payment/paystack?order=${order.id}`);
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

  const buttonText =
    paymentMethod === "pay_on_delivery"
      ? "Place Order"
      : paymentMethod === "bank_transfer"
      ? "Continue to Bank Transfer"
      : "Continue to Online Payment";

  return (
    <>
      {business && (
        <StoreNavbar
          business={business}
          storeName="Checkout"
          storeHref={storeSlug ? `/store/${storeSlug}` : "/"}
        />
      )}

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-3">
          {/* Customer Form */}
          <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
            <h1 className="mb-8 text-3xl font-semibold">Checkout</h1>

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
                  <div>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full rounded-xl border p-3 outline-none focus:border-emerald-600"
                    />


                  </div>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Pick up address"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />

                  {deliveryZones.length > 0 && (
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Delivery Area
                      </label>

                      <select
                        value={deliveryZoneId}
                        onChange={(e) => setDeliveryZoneId(e.target.value)}
                        disabled={deliveryLoading || loading}
                        className="w-full rounded-xl border p-3 outline-none focus:border-emerald-600 disabled:bg-gray-100"
                      >
                        <option value="">
                          {deliveryLoading
                            ? "Loading delivery locations..."
                            : "Select delivery location"}
				Select delivery area
                        </option>

                        {deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.location} —{" "}
                            {zone.free_delivery
                              ? "FREE DELIVERY"
                              : formatCurrency(zone.price, currency)}
                          </option>
                        ))}
                      </select>

                      {selectedDeliveryZone && (
                        <p className="mt-2 text-sm text-gray-500">
                          {selectedDeliveryZone.free_delivery
                            ? "Free delivery to this location."
                            : `Delivery fee: ${formatCurrency(
                                selectedDeliveryZone.price,
                                currency
                              )}`}
                        </p>
                      )}
                    </div>
                  )}

                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Order Notes (Optional)"
                    className="rounded-xl border p-3 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-semibold">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {business?.pay_on_delivery_enabled && (
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                      <input
                        type="radio"
                        checked={paymentMethod === "pay_on_delivery"}
                        onChange={() => setPaymentMethod("pay_on_delivery")}
                      />
                      <div>
                        <p className="font-medium">Pay on Delivery</p>
                        <p className="text-sm text-gray-500">
                          Pay when your order arrives.
                        </p>
                      </div>
                    </label>
                  )}

                  {business?.bank_transfer_enabled && (
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                      <input
                        type="radio"
                        checked={paymentMethod === "bank_transfer"}
                        onChange={() => setPaymentMethod("bank_transfer")}
                      />
                      <div>
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-sm text-gray-500">
                          Transfer directly to the merchant.
                        </p>
                      </div>
                    </label>
                  )}

                  {business?.online_payment_enabled && (
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                      <input
                        type="radio"
                        checked={paymentMethod === "paystack"}
                        onChange={() => setPaymentMethod("paystack")}
                      />
                      <div>
                        <p className="font-medium">Pay Online</p>
                        <p className="text-sm text-gray-500">
                          Card, Bank Transfer, USSD and more.
                        </p>
                      </div>
                    </label>
                  )}
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
                <div key={item.id} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
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
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {deliveryFee === 0 &&
                     selectedDeliveryZone?.free_delivery
                    ? "FREE"
                    : formatCurrency(deliveryFee, currency)}
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
              disabled={
                loading ||
                items.length === 0 ||
                (deliveryZones.length > 0 && !deliveryZoneId)
              }
              className="mt-8 w-full rounded-xl bg-emerald-600 py-4 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Please wait..." : buttonText}
            </button>
          </aside>
        </div>
      </main>
    </>
  );
}
