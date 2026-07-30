"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import toast from "react-hot-toast";

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
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold">Password & Security</h2>

      <div className="space-y-6">
        {/* Email Section */}
        <div>
          <label className="mb-1 block text-sm font-medium">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border p-3"
          />
          <button
            onClick={handleEmailChange}
            disabled={saving}
            className="mt-3 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Update Email
          </button>
        </div>

        <hr className="border-gray-100" />

        {/* Password Section */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border p-3"
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
              className="w-full rounded-xl border p-3"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}

