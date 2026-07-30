"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { updatePassword } from "../services/updatePassword";

export default function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleReset() {
    if (!password || !confirmPassword) {
      toast.error("Please complete every field.");
      return;
    }

    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await updatePassword(password);

      toast.success(
        "Password updated successfully."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err: any) {
      toast.error(
        err.message ??
          "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-8">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <h1 className="text-3xl font-bold">
          Reset Password
        </h1>

        <p className="mt-2 text-gray-500">
          Choose a new secure password.
        </p>

        <div className="mt-8 space-y-5">

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="New Password"
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
            onClick={handleReset}
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "Update Password"}
          </button>

        </div>

      </div>

    </main>
  );
}
