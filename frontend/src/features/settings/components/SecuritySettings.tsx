"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { supabase } from "@/src/lib/supabase";

export default function SecuritySettings() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);
      }
    }

    loadUser();
  }, []);

  async function handlePasswordChange() {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast.success("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update password.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEmailChange() {
    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        email,
      });

      if (error) throw error;

      toast.success("Verification email sent to your new address.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update email.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-w-0 rounded-xl border bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
      <h2 className="mb-5 text-lg font-semibold sm:mb-6 sm:text-xl">
        Password & Security
      </h2>

      <div className="space-y-5 sm:space-y-6">
        {/* Email Section */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full min-w-0 rounded-xl border p-2.5 text-sm sm:p-3 sm:text-base"
          />
          <button
            onClick={handleEmailChange}
            disabled={saving}
            className="mt-3 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 sm:px-5 sm:py-2"
          >
            Update Email
          </button>
        </div>

        <hr className="border-gray-100" />

        {/* Password Section */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full min-w-0 rounded-xl border p-2.5 text-sm sm:p-3 sm:text-base"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full min-w-0 rounded-xl border p-2.5 text-sm sm:p-3 sm:text-base"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={saving}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

