"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");

  async function createBusiness() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    const { error } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name,
        category,
        phone,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Business created successfully!");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-emerald-600">
          Create Your Business
        </h1>

        <input
          className="mb-4 w-full rounded-lg border p-3"
          placeholder="Business Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mb-4 w-full rounded-lg border p-3"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <input
          className="mb-6 w-full rounded-lg border p-3"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={createBusiness}
          className="w-full rounded-lg bg-emerald-600 p-3 font-semibold text-white hover:bg-emerald-700"
        >
          Create Business
        </button>
      </div>
    </main>
  );
}
