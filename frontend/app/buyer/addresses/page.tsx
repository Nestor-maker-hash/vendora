"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type BuyerAddress = {
  id: string;
  buyer_id: string;
  label: string;
  full_name: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type AddressForm = {
  label: string;
  full_name: string;
  phone: string;
  state: string;
  city: string;
  address: string;
};

const emptyForm: AddressForm = {
  label: "Home",
  full_name: "",
  phone: "",
  state: "",
  city: "",
  address: "",
};

export default function BuyerAddressesPage() {
  const [addresses, setAddresses] = useState<BuyerAddress[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAddresses() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("Please sign in to view your addresses.");
      }

      const { data, error: addressError } = await supabase
        .from("buyer_addresses")
        .select("*")
        .eq("buyer_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (addressError) {
        throw addressError;
      }

      setAddresses((data ?? []) as BuyerAddress[]);
    } catch (err) {
      console.error("Failed to load buyer addresses:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your delivery addresses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(address: BuyerAddress) {
    setEditingId(address.id);

    setForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      state: address.state,
      city: address.city,
      address: address.address,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function updateField(field: keyof AddressForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!form.full_name.trim()) {
      setError("Please enter the recipient's full name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter the recipient's phone number.");
      return;
    }

    if (!form.state.trim()) {
      setError("Please enter the state.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter the city.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter the delivery address.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("Please sign in to save an address.");
      }

      const payload = {
        buyer_id: user.id,
        label: form.label.trim() || "Home",
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("buyer_addresses")
          .update({
            label: payload.label,
            full_name: payload.full_name,
            phone: payload.phone,
            state: payload.state,
            city: payload.city,
            address: payload.address,
            updated_at: payload.updated_at,
          })
          .eq("id", editingId)
          .eq("buyer_id", user.id);

        if (updateError) {
          throw updateError;
        }

        setSuccess("Address updated successfully.");
      } else {
        const shouldBeDefault = addresses.length === 0;

        const { error: insertError } = await supabase
          .from("buyer_addresses")
          .insert({
            ...payload,
            is_default: shouldBeDefault,
          });

        if (insertError) {
          throw insertError;
        }

        setSuccess("Address saved successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadAddresses();
    } catch (err) {
      console.error("Failed to save buyer address:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your delivery address."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    setSuccess("");

    const address = addresses.find((item) => item.id === id);

    if (!address) return;

    const confirmed = window.confirm(
      `Delete "${address.label}" address?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const { error: deleteError } = await supabase
        .from("buyer_addresses")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      const remaining = addresses.filter((item) => item.id !== id);

      setAddresses(remaining);

      if (address.is_default && remaining.length > 0) {
        await makeDefault(remaining[0].id, true);
      } else {
        setSuccess("Address deleted.");
      }
    } catch (err) {
      console.error("Failed to delete buyer address:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this address."
      );
    } finally {
      setDeletingId(null);
    }
  }async function makeDefault(id: string, silent = false) {
    if (!silent) {
      setError("");
      setSuccess("");
    }

    try {
      setDefaultingId(id);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        throw new Error("Please sign in to update your addresses.");
      }

      const { error: clearError } = await supabase
        .from("buyer_addresses")
        .update({
          is_default: false,
          updated_at: new Date().toISOString(),
        })
        .eq("buyer_id", user.id);

      if (clearError) {
        throw clearError;
      }

      const { error: setError } = await supabase
        .from("buyer_addresses")
        .update({
          is_default: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("buyer_id", user.id);

      if (setError) {
        throw setError;
      }

      await loadAddresses();

      if (!silent) {
        setSuccess("Default address updated.");
      }
    } catch (err) {
      console.error("Failed to set default address:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to set the default address."
      );
    } finally {
      setDefaultingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/buyer"
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            <span>My Account</span>
          </Link>

          <Link href="/marketplace">
            <img
              src="/icon.png"
              alt="Vendora"
              className="h-9 w-9 rounded-xl object-cover"
            />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
              Delivery Addresses
            </p>

            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Where should we deliver?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Save your delivery locations for faster checkout.
            </p>
          </div>

          {!showForm && (
            <button
              type="button"
              onClick={openAddForm}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus size={16} />
              Add address
            </button>
          )}
        </div>

        {error && !showForm && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && !showForm && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <Check size={16} />
            {success}
          </div>
        )}

        {showForm && (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {editingId ? "Edit address" : "Add delivery address"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Enter the details exactly as the delivery person should use them.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="address-label"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Address label
                </label>

                <input
                  id="address-label"
                  value={form.label}
                  onChange={(event) =>
                    updateField("label", event.target.value)
                  }
                  placeholder="Home, School, Office..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="address-full-name"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Recipient name
                  </label>

                  <input
                    id="address-full-name"
                    value={form.full_name}
                    onChange={(event) =>
                      updateField("full_name", event.target.value)
                    }
                    placeholder="Full name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address-phone"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Phone number
                  </label>

                  <input
                    id="address-phone"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    placeholder="Phone number"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="address-state"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    State
                  </label>

                  <input
                    id="address-state"
                    value={form.state}
                    onChange={(event) =>updateField("state", event.target.value)
                    }
                    placeholder="State"
                    autoComplete="address-level1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address-city"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    City
                  </label>

                  <input
                    id="address-city"
                    value={form.city}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    placeholder="City"
                    autoComplete="address-level2"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Delivery address
                </label>

                <textarea
                  id="address"
                  value={form.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  placeholder="Street, house number, landmark..."
                  rows={3}
                  autoComplete="street-address"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 size={17} className="animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update address"
                      : "Save address"}
                </button>
              </div>
            </div>
          </section>
        )}

        {!showForm && (
          <section className="mt-7">
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 text-sm text-slate-500 shadow-sm">
                <Loader2 size={18} className="mr-2 animate-spin" />
                Loading addresses...
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <MapPin size={21} className="text-emerald-600" />
                </div>

                <h2 className="mt-4 text-sm font-bold text-slate-900">
                  No saved addresses yet
                </h2>

                <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
                  Add a delivery address so you can check out faster next time.
                </p>

                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Plus size={15} />
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <article
                    key={address.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                          <MapPin
                            size={18}
                            className="text-emerald-600"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-900">
                              {address.label}
                            </h2>

                            {address.is_default && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                <Star size={10} />
                                Default
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {address.full_name}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {address.address}
                            <br />
                            {address.city}, {address.state}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {address.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditForm(address)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Edit ${address.label}`}
                          title="Edit address"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(address.id)}
                          disabled={deletingId === address.id}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          aria-label={`Delete ${address.label}`}
                          title="Delete address"
                        >
                          {deletingId === address.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() => makeDefault(address.id)}
                        disabled={defaultingId === address.id}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700 disabled:opacity-50"
                      >
                        {defaultingId === address.id ? (
                          <Loader2
                            size={13}
                            className="animate-spin"
                          />
                        ) : (
                          <Star size={13} />
                        )}
                        Set as default
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <Link
          href="/buyer/profile"
          className="mt-5 block text-center text-xs font-semibold text-slate-500 transition hover:text-emerald-600"
        >
          ← Back to profile
        </Link>
      </div>
    </main>
  );
}
