"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { login } from "../services/login";
import { getBusinessAfterLogin } from "../services/getBusinessAfterLogin";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  async function handleLogin() {
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const user = await login(email, password);

      const business =
        await getBusinessAfterLogin(user.id);

      toast.success("Welcome back!");

      if (business) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      toast.error(
        err.message ?? "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2">

      <section className="hidden lg:flex flex-col justify-center bg-emerald-600 p-16 text-white">

        <h1 className="text-5xl font-bold">
          Welcome back.
        </h1>

        <p className="mt-6 text-lg text-emerald-100">
          Run your products, customers,
          orders and business from one
          beautiful platform.
        </p>

      </section>

      <section className="flex items-center justify-center bg-slate-50 p-8">

        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

          <h2 className="text-3xl font-bold">
            Login
          </h2>

          <p className="mt-2 text-gray-500">
            Welcome back to Vendora.
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

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>

            <div className="flex justify-between text-sm">

              <Link
                href="/forgot-password"
                className="text-emerald-600"
              >
                Forgot Password?
              </Link>

              <Link
                href="/signup"
                className="text-emerald-600"
              >
                Create Account
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
