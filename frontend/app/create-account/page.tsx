"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { loginWithGoogle } from "@/src/features/auth/services/loginWithGoogle";

export default function CreateAccountPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    try {
      setLoading(true);

      await loginWithGoogle();
    } catch (err: any) {
      toast.error(
        err?.message ?? "Unable to continue with Google."
      );

      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-3xl font-bold text-emerald-600"
          >
            Vendora
          </Link>

          <h1 className="mt-8 text-3xl font-bold text-gray-900">
            Start selling with Vendora
          </h1>

          <p className="mt-3 text-gray-500">
            Create your merchant account and start building
            your online business.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-6 py-4 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-lg font-bold">
                G
              </span>

              {loading
                ? "Connecting to Google..."
                : "Continue with Google"}
            </button>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-sm text-gray-400">
                or
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <Link
              href="/signup"
              className="block w-full rounded-xl bg-emerald-600 px-6 py-4 text-center font-semibold text-white transition hover:bg-emerald-700"
            >
              Continue with Email
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have a Vendora account?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          By continuing, you agree to Vendora&apos;s terms
          and policies.
        </p>
      </div>
    </main>
  );
}
