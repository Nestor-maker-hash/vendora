"use client";

import Link from "next/link";
import { ArrowLeft, Check, Loader2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function BuyerProfilePage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
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
          throw new Error("Please sign in to view your profile.");
        }

        const { data: profile, error: profileError } = await supabase
          .from("buyer_profiles")
          .select("full_name, email, phone")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!mounted) return;

        setFullName(profile?.full_name ?? "");
        setPhone(profile?.phone ?? "");
        setEmail(profile?.email ?? user.email ?? "");
      } catch (err) {
        if (!mounted) return;

        console.error("Failed to load buyer profile:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    setSaved(false);
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
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
        throw new Error("Please sign in to update your profile.");
      }

      const { error: saveError } = await supabase
        .from("buyer_profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (saveError) {
        throw saveError;
      }

      setSaved(true);
    } catch (err) {
      console.error("Failed to save buyer profile:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your profile."
      );
    } finally {
      setSaving(false);
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

      <div className="mx-auto max-w-2xl px-4 py-7 sm:px-6 sm:py-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            My Profile
          </p>

          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Personal information
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Keep your contact information up to date for faster checkout.
          </p>
        </div>

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <UserRound size={20} className="text-emerald-600" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Contact information
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Used to make checkout faster.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-500">
              <Loader2 size={18} className="mr-2 animate-spin" />
              Loading profile...
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="full-name"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Your phone number"
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setSaved(false);
                  }}
                  placeholder="Your email address"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {saved && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <Check size={16} />
                  Profile updated successfully.
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && <Loader2 size={17} className="animate-spin" />}
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </section>

        <Link
          href="/buyer/addresses"
          className="mt-4 block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
        >
          <p className="text-sm font-bold text-slate-900">
            Manage delivery addresses
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Save multiple delivery locations for faster checkout.
          </p>
        </Link>
      </div>
    </main>
  );
}
