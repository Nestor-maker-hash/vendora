"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ProductImagePage() {
  const searchParams = useSearchParams();
  const src = searchParams.get("src");
  const requestedBack = searchParams.get("back");

  const back =
    requestedBack &&
    (requestedBack === "/products/new" ||
      /^\/products\/[^/]+\/edit$/.test(requestedBack))
      ? requestedBack
      : "/products/new";

  if (!src) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-6">
        <div className="text-center text-white">
          <p className="mb-4">No image selected.</p>

          <Link
            href={back}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
          >
            <ArrowLeft size={16} />
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="fixed left-4 top-4 z-10">
        <Link
          href={back}
          className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-black shadow-lg backdrop-blur hover:bg-white"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      <div className="flex min-h-screen items-center justify-center p-4 sm:p-8">
        <img
          src={src}
          alt="Full product preview"
          className="max-h-[calc(100vh-2rem)] max-w-full object-contain sm:max-h-[calc(100vh-4rem)]"
        />
      </div>
    </main>
  );
}
