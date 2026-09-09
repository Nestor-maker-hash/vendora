"use client";

import { Search } from "lucide-react";
import { useState } from "react";

interface MarketplaceSearchProps {
  initialSearch?: string;
}

export default function MarketplaceSearch({
  initialSearch = "",
}: MarketplaceSearchProps) {
  const [search, setSearch] = useState(initialSearch);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();

    const value = search.trim();

    window.location.href = value
      ? `/marketplace?search=${encodeURIComponent(value)}`
      : "/marketplace";
  }

  return (
    <form
      onSubmit={submitSearch}
      className="mx-auto mt-6 flex w-full max-w-2xl items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 shadow-sm transition focus-within:border-emerald-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100"
    >
      <Search
        size={18}
        className="shrink-0 text-slate-400"
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products or stores..."
        aria-label="Search products or stores"
        className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
      />

      <button
        type="submit"
        className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
      >
        Search
      </button>
    </form>
  );
}
