"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import { signup } from "../services/signup";
import { loginWithGoogle } from "../services/loginWithGoogle";

function getPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label = "Very Weak";
  let width = "0%";

  if (score === 1) {
    label = "Weak";
    width = "20%";
  } else if (score === 2) {
    label = "Fair";
    width = "40%";
  } else if (score === 3) {
    label = "Good";
    width = "60%";
  } else if (score === 4) {
    label = "Strong";
    width = "80%";
  } else if (score === 5) {
    label = "Excellent";
    width = "100%";
  }

  return {
    checks,
    score,
    label,
    width,
  };
}


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

  const [googleLoading, setGoogleLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

const [showVerificationScreen, setShowVerificationScreen] =
  useState(false);

const passwordStrength =
  getPasswordStrength(password); 

  async function handleGoogleSignup() {
    try {
      setGoogleLoading(true);

      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google signup failed:", err);

      toast.error(
        err?.message ??
          "Unable to continue with Google."
      );

      setGoogleLoading(false);
    }
  }

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

    const user = await signup(
      email,
      password,
      fullName
    );

    setShowVerificationScreen(true);
  } catch (err: any) {
  console.error("Signup failed:", err);

  const message =
    err?.message?.toLowerCase() ?? "";

  if (
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user already registered")
  ) {
    toast.error(
      "An account with this email already exists. Please log in instead.",
      {
        duration: 5000,
      }
    );
  } else {
    toast.error(
      err?.message ?? "Signup failed."
    );
  }
} finally {
  setLoading(false);
}

}
if (showVerificationScreen) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl text-center">

        <div className="text-5xl mb-6">📧</div>

        <h1 className="text-3xl font-bold">
          Verify your email
        </h1>

        <p className="mt-4 text-gray-600">
          We've sent a verification link to
        </p>

        <p className="mt-2 font-semibold break-all">
          {email}
        </p>

        <p className="mt-6 text-gray-500">
          Please check your inbox and click the verification link to activate your Vendora account.
        </p>

        <p className="mt-4 text-sm text-gray-400">
          If you don&apos;t see the email, check your Spam or Promotions folder.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-block w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white hover:bg-emerald-700"
        >
          Go to Login
        </Link>

      </div>
    </main>
  );
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

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-6 py-4 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

            {googleLoading
              ? "Connecting to Google..."
              : "Continue with Google"}
          </button>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-sm text-gray-400">
              or
            </span>

            <div className="h-px flex-1 bg-gray-200" />
          </div>


          <div className="mt-6 space-y-5">

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
<div className="space-y-3">

  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
    <div
      className="h-full rounded-full bg-emerald-600 transition-all duration-300"
      style={{ width: passwordStrength.width }}
    />
  </div>

  <p className="text-sm font-medium text-gray-600">
    Password strength: {passwordStrength.label}
  </p>

  <div className="grid grid-cols-1 gap-1 text-sm">

    <p className={passwordStrength.checks.length ? "text-emerald-600" : "text-gray-400"}>
      {passwordStrength.checks.length ? "✓" : "○"} At least 8 characters
    </p>

    <p className={passwordStrength.checks.lowercase ? "text-emerald-600" : "text-gray-400"}>
      {passwordStrength.checks.lowercase ? "✓" : "○"} Lowercase letter
    </p>

    <p className={passwordStrength.checks.uppercase ? "text-emerald-600" : "text-gray-400"}>
      {passwordStrength.checks.uppercase ? "✓" : "○"} Uppercase letter
    </p>

    <p className={passwordStrength.checks.number ? "text-emerald-600" : "text-gray-400"}>
      {passwordStrength.checks.number ? "✓" : "○"} Number
    </p>

    <p className={passwordStrength.checks.symbol ? "text-emerald-600" : "text-gray-400"}>
      {passwordStrength.checks.symbol ? "✓" : "○"} Special character
    </p>

  </div>

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
