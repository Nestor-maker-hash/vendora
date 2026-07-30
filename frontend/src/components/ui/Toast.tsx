"use client";

import Link from "next/link";

interface Props {
  show: boolean;
  title: string;
  message?: string;
  continueHref: string;
}

export default function Toast({
  show,
  title,
  message,
  continueHref,
}: Props) {
  return (
    <div
      className={`fixed left-1/2 top-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10 transition-all duration-300 ${
        show
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xl">
          ✅
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">
            {title}
          </h3>

          {message && (
            <p className="mt-1 text-sm text-gray-600">
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <Link
          href="/cart"
          className="flex-1 rounded-xl bg-emerald-600 py-3 text-center font-medium text-white transition hover:bg-emerald-700"
        >
          View Cart
        </Link>

	<Link
  href={continueHref}
  className="rounded-xl border px-5 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-100"
>
  Continue Shopping
</Link>
      </div>
    </div>
  );
}
