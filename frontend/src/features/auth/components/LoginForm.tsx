"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { login } from "../services/login";
import { getBusinessAfterLogin } from "../services/getBusinessAfterLogin";
import { resendVerificationEmail } from "../services/resendVerificationEmail";
import { loginWithGoogle } from "../services/loginWithGoogle";
import { getCurrentUserRole } from "../services/getCurrentUserRole";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = (() => {
    const next = searchParams.get("next");

    if (!next || !next.startsWith("/") || next.startsWith("//")) {
      return null;
    }

    return next;
  })();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleResendVerificationEmail() {
    if (!email.trim()) {
      toast.error("Please enter your email address first.");
      return;
    }

    try {
      setResendingEmail(true);

      await resendVerificationEmail(email);

      toast.success("Verification email sent! Please check your inbox.", {
        duration: 4000,
      });

      setShowResendVerification(false);
    } catch (err: any) {
      toast.error(err.message ?? "Unable to resend verification email.");
    } finally {
      setResendingEmail(false);
    }
  }

 async function handleGoogleLogin() {
  try {
    setGoogleLoading(true);

    await loginWithGoogle(returnTo ?? undefined);
  } catch (err: any) {
    console.error("Google login failed:", err);

    toast.error(
      err?.message ?? "Unable to continue with Google."
    );

    setGoogleLoading(false);
  }
}


 async function handleLogin() {
  if (!email || !password) {
    toast.error("Please fill in all fields.");
    return;
  }

  try {
    setLoading(true);

    const user = await login(email, password);

    const role = await getCurrentUserRole(user.id);

    toast.success("Welcome back!");

    if (role === "super_admin") {
      router.replace("/immortal");
      return;
    }

    if (returnTo) {
      router.replace(returnTo);
      return;
    }

    const business = await getBusinessAfterLogin(user.id);

    if (business) {
      router.replace("/dashboard");
    } else {
      router.replace("/onboarding");
    }
  } catch (err: any) {
    const message = err?.message?.toLowerCase() ?? "";

    if (
      message.includes("email not confirmed") ||
      message.includes("email not verified")
    ) {
      toast(
        "📧 Please verify your email before signing in. Check your inbox or Spam folder.",
        {
          duration: 4000,
        }
      );

      setShowResendVerification(true);
    } else {
      toast.error(err?.message ?? "Login failed.");
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-center bg-emerald-600 p-16 text-white">
        <h1 className="text-5xl font-bold">Welcome back.</h1>

        <p className="mt-6 text-lg text-emerald-100">
          Run your products, customers, orders and business from one
          beautiful platform.
        </p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <h2 className="text-3xl font-bold">Login</h2>

          <p className="mt-2 text-gray-500">Welcome back to Vendora.</p>


	<button
  type="button"
  onClick={handleGoogleLogin}
  disabled={loading || googleLoading}
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

  {googleLoading
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



          <div className="mt-8 space-y-5">
            <input
              autoFocus
              type="email"
              placeholder="Email"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border p-4 pr-16 outline-none focus:border-emerald-600"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="space-y-4">
              {showResendVerification && (
                <button
                  type="button"
                  onClick={handleResendVerificationEmail}
                  disabled={resendingEmail || !email.trim()}
                  className="text-sm text-emerald-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {resendingEmail
                    ? "Sending verification email..."
                    : "Resend verification email"}
                </button>
              )}

              <div className="flex justify-between text-sm">
                <Link href="/forgot-password" className="text-emerald-600">
                  Forgot Password?
                </Link>

                <Link href="/signup" className="text-emerald-600">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
