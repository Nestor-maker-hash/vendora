"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import { forgotPassword } from "../services/forgotPassword";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleReset() {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email);

      toast.success(
        "Password reset email sent. Check your inbox."
      );
    } catch (err: any) {
      toast.error(
        err.message ??
          "Unable to send reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">

      <section className="hidden lg:flex flex-col justify-center bg-emerald-600 p-16 text-white">

        <h1 className="text-5xl font-bold">
          Reset your password.
        </h1>

        <p className="mt-6 text-lg text-emerald-100">
          We'll send you a secure link to create
          a new password.
        </p>

      </section>

      <section className="flex items-center justify-center bg-slate-50 p-8">

        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold">
            Forgot Password
          </h2>

          <p className="mt-2 text-gray-500">
            Enter the email linked to your account.
          </p>

          <div className="mt-8 space-y-5">

            <input
              autoFocus
              type="email"
              placeholder="Email"
              value={email}
              disabled={loading}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            />

            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-emerald-600"
              >
                Login
              </Link>
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
