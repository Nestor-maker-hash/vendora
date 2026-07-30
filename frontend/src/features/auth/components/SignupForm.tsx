"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import { signup } from "../services/signup";

export default function SignupForm() {
  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  async function handleSignup() {
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please complete every field.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await signup(
        email,
        password,
        fullName
      );

      toast.success(
        "Account created! Please verify your email before logging in."
      );
    } catch (err: any) {
      toast.error(
        err.message ?? "Signup failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">

      <section className="hidden lg:flex flex-col justify-center bg-emerald-600 p-16 text-white">

        <h1 className="text-5xl font-bold">
          Start selling smarter.
        </h1>

        <p className="mt-6 text-lg text-emerald-100">
          Join thousands of African merchants
          building modern businesses with
          Vendora.
        </p>

      </section>

      <section className="flex items-center justify-center bg-slate-50 p-8">

        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold">
            Create Account
          </h2>

          <p className="mt-2 text-gray-500">
            Create your free Vendora account.
          </p>

          <div className="mt-8 space-y-5">

            <input
              autoFocus
              placeholder="Full Name"
              value={fullName}
              disabled={loading}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              disabled={loading}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            />

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={password}
                disabled={loading}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-xl border p-4 pr-16 outline-none focus:border-emerald-600"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-4 text-sm text-gray-500"
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Confirm Password"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            />

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

            <p className="text-center text-sm text-gray-500">

              Already have an account?{" "}

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
