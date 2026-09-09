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
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.79-.07-1.55-.21-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.78h3.14c1.84-1.69 2.92-4.19 2.92-7.74Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.75c2.62 0 4.82-.87 6.43-2.36l-3.14-2.78c-.87.58-1.98.92-3.29.92-2.53 0-4.67-1.71-5.44-4.01H3.31v2.87A9.75 9.75 0 0 0 12 21.75Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.56 13.52A5.86 5.86 0 0 1 6.26 12c0-.53.09-1.04.3-1.52V7.61H3.31A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.06 4.39l3.25-2.87Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.47c1.42 0 2.69.49 3.69 1.45l2.77-2.77C16.81 3.61 14.62 2.25 12 2.25a9.75 9.75 0 0 0-8.69 5.36l3.25 2.87c.77-2.3 2.91-4.01 5.44-4.01Z"
                />
              </svg>

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
