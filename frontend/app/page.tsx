"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-emerald-600">
            Vendora
          </h1>
	<div className="space-x-4">
  <Link
    href="/login"
    className="rounded-lg px-4 py-2 text-gray-700 hover:text-emerald-600"
  >
    Login
  </Link>

  <Link
    href="/signup"
    className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700"
  >
    Get Started
  </Link>
</div>

        </div>
      </nav>

      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center">
        <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
          Commerce OS for African Businesses
        </span>

        <h2 className="mt-8 max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900">
          Sell Smarter. Grow Faster.
        </h2>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Vendora helps merchants manage products, customers, inventory,
          and orders from one modern platform.
        </p>

        <div className="mt-10 flex gap-4">
	<Link
  href="/signup"
  className="rounded-xl bg-emerald-600 px-8 py-4 font-semibold text-white hover:bg-emerald-700"
>
  Start Free
</Link>
          <button className="rounded-xl border border-gray-300 bg-white px-8 py-4 font-semibold hover:bg-gray-100">
            Learn More
          </button>
        </div>
      </section>
    </main>
  );
}
