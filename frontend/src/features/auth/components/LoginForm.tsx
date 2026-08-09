"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { login } from "../services/login";
import { getBusinessAfterLogin } from "../services/getBusinessAfterLogin";
import { resendVerificationEmail } from "../services/resendVerificationEmail";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  async function handleLogin() {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const user = await login(email, password);

      const business = await getBusinessAfterLogin(user.id);

      toast.success("Welcome back!");

      if (business) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
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
        toast.error(err.message ?? "Login failed.");
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

