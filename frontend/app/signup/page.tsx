"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: "http://localhost:3000/login",
  },
});

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created! Check your email to verify your account.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-emerald-600">
          Create your Vendora account
        </h1>

        <input
          className="mb-4 w-full rounded-lg border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-6 w-full rounded-lg border p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signUp}
          className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-700"
        >
          Create Account
        </button>
      </div>
    </main>
  );
}
