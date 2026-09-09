"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useCart } from "@/src/features/cart/context/CartContext";
import StoreNavbar from "@/src/components/store/StoreNavbar";
import { getBusinessById } from "@/src/features/business/services/getBusinessById";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { PaymentMethod } from "@/src/features/orders/types/order";
import { Business } from "@/src/features/business/types/business";
import type { DeliveryZone } from "@/src/features/delivery/types/deliveryZone";
import { getDeliveryZones } from "@/src/features/delivery/services/getDeliveryZones";

type BuyerAddress = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  is_default: boolean;
};
import { supabase } from "@/src/lib/supabase";
import { loginWithGoogle } from "@/src/features/auth/services/loginWithGoogle";

function CheckoutContent() {
  const {
    items,
    getItemsForBusiness,
    clearBusinessCart,
  } = useCart();

  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get("business");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pay_on_delivery");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [deliveryZoneId, setDeliveryZoneId] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const [buyerAddresses, setBuyerAddresses] = useState<BuyerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressesLoading, setAddressesLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCustomerSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setAuthenticated(Boolean(session?.user));

        // Load saved buyer contact information.
        // The checkout draft below can override these values when
        // the buyer is returning from authentication.
        if (session?.user) {
          setAddressesLoading(true);

          try {
            const { data: buyerProfile, error: buyerProfileError } =
              await supabase
                .from("buyer_profiles")
                .select("full_name, email, phone")
                .eq("id", session.user.id)
                .maybeSingle();

            if (buyerProfileError) {
              console.error(
                "Failed to load buyer profile:",
                buyerProfileError
              );
            } else if (buyerProfile) {
              setCustomerName(buyerProfile.full_name ?? "");
              setCustomerPhone(buyerProfile.phone ?? "");
              setCustomerEmail(
                buyerProfile.email ?? session.user.email ?? ""
              );
            } else {
              // A newly authenticated buyer may not have a buyer
              // profile yet, so at least use their auth email.
              setCustomerEmail(session.user.email ?? "");
            }
          } catch (error) {
            console.error(
              "Failed to load buyer profile:",
              error
            );

            setCustomerEmail(session.user.email ?? "");
          }

          try {
            const { data: savedAddresses, error: addressesError } =
              await supabase
                .from("buyer_addresses")
                .select(
                  "id, label, full_name, phone, state, city, address, is_default"
                )
                .eq("buyer_id", session.user.id)
                .order("is_default", { ascending: false })
                .order("created_at", { ascending: false });

            if (addressesError) {
              console.error(
                "Failed to load buyer addresses:",
                addressesError
              );
            } else if (savedAddresses) {
              setBuyerAddresses(savedAddresses as BuyerAddress[]);

              const defaultAddress = savedAddresses.find(
                (savedAddress) => savedAddress.is_default
              );

              if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
                setState(defaultAddress.state);
                setCity(defaultAddress.city);
                setAddress(defaultAddress.address);
                setCustomerName(defaultAddress.full_name);
                setCustomerPhone(defaultAddress.phone);
              }
            }
          } catch (error) {
            console.error(
              "Failed to load buyer addresses:",
              error
            );
          } finally {
            setAddressesLoading(false);
          }
        }

        const savedCheckout = sessionStorage.getItem(
          "vendora_checkout_draft"
        );

        if (savedCheckout) {
          try {
            const draft = JSON.parse(savedCheckout);

            // Only restore fields that actually exist in the draft.
            // This prevents an empty draft from erasing saved profile data.
            if (draft.customerName) {
              setCustomerName(draft.customerName);
            }

            if (draft.customerPhone) {
              setCustomerPhone(draft.customerPhone);
            }

            if (draft.customerEmail) {
              setCustomerEmail(draft.customerEmail);
            }

            if (draft.state) {
              setState(draft.state);
            }

            if (draft.city) {
              setCity(draft.city);
            }

            if (draft.address) {
              setAddress(draft.address);
            }

            if (draft.notes) {
              setNotes(draft.notes);
            }

            if (draft.deliveryZoneId) {
              setDeliveryZoneId(draft.deliveryZoneId);
            }

            if (draft.paymentMethod) {
              setPaymentMethod(draft.paymentMethod);
            }
          } catch (error) {
            console.error(
              "Failed to restore checkout draft:",
              error
            );
          }

          sessionStorage.removeItem(
            "vendora_checkout_draft"
          );
        }
      } catch (error) {
        console.error(
          "Failed to determine customer session:",
          error
        );
      } finally {
        if (mounted) {
          setAuthChecking(false);
        }
      }
    }

    loadCustomerSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAuthenticated(Boolean(session?.user));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!businessId) {
      setBusiness(null);
      return;
    }

    async function loadBusiness() {
      try {
        const data = await getBusinessById(businessId!);
        setBusiness(data);
      } catch (error) {
        console.error("Failed to load checkout business:", error);
        setBusiness(null);
      }
    }

    loadBusiness();
  }, [businessId]);

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



  const checkoutItems = businessId
    ? getItemsForBusiness(businessId)
    : [];

  const currency = business?.currency ?? "";

  useEffect(() => {
    if (!business) return;

    if (business.pay_on_delivery_enabled) {
      setPaymentMethod("pay_on_delivery");
      return;
    }

    if (business.online_payment_enabled) {
      setPaymentMethod("online_payment");
    }
  }, [business]);

  const subtotal = checkoutItems.reduce(
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
    if (!businessId || !business) {
      alert("Store information is missing.");
      return;
    }

    if (checkoutItems.length === 0) {
      alert("There are no products from this store in your cart.");
      router.push("/cart");
      return;
    }

    if (!customerName || !customerPhone || !state || !city || !address) {
      alert("Please complete all required fields.");
      return;
    }

    if (
      paymentMethod === "online_payment" &&
      !customerEmail.trim()
    ) {
      alert(
        "Please enter your email address to continue with online payment."
      );
      return;
    }

    if (!deliveryZoneId) {
  alert("Please select a delivery area.");
  return;
}

    if (!authenticated) {
      sessionStorage.setItem(
        "vendora_checkout_draft",
        JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          state,
          city,
          address,
          notes,
          deliveryZoneId,
          paymentMethod,
        })
      );

      try {
        setLoading(true);

        const returnTo = `/checkout?business=${encodeURIComponent(
          businessId
        )}`;

        await loginWithGoogle(returnTo);
      } catch (error) {
        console.error("Google checkout authentication failed:", error);

        sessionStorage.removeItem(
          "vendora_checkout_draft"
        );

        alert(
          error instanceof Error
            ? error.message
            : "Unable to continue with Google."
        );

        setLoading(false);
      }

      return;
    }

    setLoading(true);

    try {
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
          items: checkoutItems,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Failed to create order.");
      }

      const order = result.order;
      const slug = business.slug;

      clearBusinessCart(businessId);

      if (paymentMethod === "pay_on_delivery") {
        router.push(
          `/order-success?order=${encodeURIComponent(
            order.id
          )}&store=${encodeURIComponent(slug)}`
        );
        return;
      }

      router.push(`/payment/online?token=${order.public_token}`);
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

  const buttonText = !authenticated
    ? "Continue with Google"
    : paymentMethod === "pay_on_delivery"
    ? "Place Order"
    : "Continue to Online Payment";

  return (
    <>
      {business && (
        <StoreNavbar
          business={business}
          storeName="Checkout"
          storeHref={
            business?.slug
              ? `/store/${business.slug}`
              : "/marketplace"
          }
        />
      )}

      <main className="min-h-screen bg-slate-50 py-5 sm:py-8">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Customer Form */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Checkout</h1>

            <div className="space-y-5">
              <div>
                <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                  Contact Information
                </h2>

                <div className="grid gap-3">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <input
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder={
                      paymentMethod === "online_payment"
                        ? "Email (Required for Online Payment)"
                        : "Email (Optional)"
                    }
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                  Delivery Address
                </h2>

                {buyerAddresses.length > 0 && (
                  <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                    <label
                      htmlFor="saved-address"
                      className="mb-1.5 block text-xs font-semibold text-slate-700"
                    >
                      Use a saved address
                    </label>

                    <select
                      id="saved-address"
                      value={selectedAddressId}
                      onChange={(event) => {
                        const nextId = event.target.value;
                        setSelectedAddressId(nextId);

                        const selectedAddress = buyerAddresses.find(
                          (savedAddress) => savedAddress.id === nextId
                        );

                        if (!selectedAddress) {
                          return;
                        }

                        setCustomerName(selectedAddress.full_name);
                        setCustomerPhone(selectedAddress.phone);
                        setState(selectedAddress.state);
                        setCity(selectedAddress.city);
                        setAddress(selectedAddress.address);
                      }}
                      disabled={addressesLoading || loading}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                    >
                      <option value="">
                        Select a saved address
                      </option>

                      {buyerAddresses.map((savedAddress) => (
                        <option
                          key={savedAddress.id}
                          value={savedAddress.id}
                        >
                          {savedAddress.label} — {savedAddress.city},{" "}
                          {savedAddress.state}
                          {savedAddress.is_default ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                      You can still change the address details below.
                    </p>
                  </div>
                )}
                <div className="grid gap-3">
                  <input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <div>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />


                  </div>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Pick up address"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />

                  {deliveryZones.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
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
                        <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
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
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                  Payment Method
                </h2>

                <div className="space-y-2.5">
                  {business?.pay_on_delivery_enabled && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/30 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                      <input
                        type="radio"
                        checked={paymentMethod === "pay_on_delivery"}
                        onChange={() => setPaymentMethod("pay_on_delivery")}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Pay on Delivery</p>
                        <p className="text-xs leading-5 text-slate-500">
                          Pay when your order arrives.
                        </p>
                      </div>
                    </label>
                  )}
                  {business?.online_payment_enabled && (
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/30 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                      <input
                        type="radio"
                        checked={paymentMethod === "online_payment"}
                        onChange={() => setPaymentMethod("online_payment")}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Pay Online</p>
                        <p className="text-xs leading-5 text-slate-500">
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
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
              Order Summary
            </h2>

            <div className="mt-4 space-y-3">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs leading-5 text-slate-500">
                      Qty {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.price * item.quantity, currency)}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-4 border-t border-slate-100" />

            <div className="space-y-2.5">
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

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-bold">
                <span>Total</span>

                <span className="text-lg font-bold tracking-tight text-emerald-600">
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={
                loading ||
                authChecking ||
                checkoutItems.length === 0 ||
                (deliveryZones.length > 0 && !deliveryZoneId)
              }
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
            >
              {authChecking ? "Checking account..." : loading ? "Please wait..." : buttonText}
            </button>
          </aside>
        </div>
      </main>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
