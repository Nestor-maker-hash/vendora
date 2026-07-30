"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  useOnboardingContext,
} from "../context/OnboardingContext";
import { checkSlugAvailability } from "@/src/features/business/services/checkSlugAvailability";

interface Props {
  back: () => void;
  next: () => void;
}

export default function StepStore({
  back,
  next,
}: Props) {
  const { data, update } =
    useOnboardingContext();

  const [slugEdited, setSlugEdited] =
    useState(false);

const [checking, setChecking] =
  useState(false);

const [available, setAvailable] =
  useState<boolean | null>(null);

  useEffect(() => {
    if (slugEdited) return;

    update({
      slug: data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-"),
    });

  }, [data.name]);

useEffect(() => {
  if (!data.slug.trim()) {
    setAvailable(null);
    return;
  }

  const timer = setTimeout(async () => {
    setChecking(true);

    const ok =
      await checkSlugAvailability(
        data.slug
      );

    setAvailable(ok);

    setChecking(false);

  }, 500);

  return () => clearTimeout(timer);

}, [data.slug]);


  function handleNext() {
    if (!data.description.trim()) {
      toast.error(
        "Please enter a business description."
      );
      return;
    }

    if (!data.slug.trim()) {
      toast.error(
        "Please choose a store URL."
      );
      return;
    }
	if (available === false) {
  toast.error(
    "Please choose another store URL."
  );

  return;
}	
    next();
  }

  return (
    <div>

      <h1 className="text-3xl font-bold">
        Store Details
      </h1>

      <p className="mt-2 text-gray-500">
        Tell customers about your business.
      </p>
<div className="mt-8 space-y-6">

        <div>

          <label className="mb-2 block font-medium">
            Business Description
          </label>

          <textarea
            rows={5}
            value={data.description}
            onChange={(e) =>
              update({
                description:
                  e.target.value,
              })
            }
            className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            placeholder="Describe your business..."
          />

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Store URL
          </label>

          <div className="flex overflow-hidden rounded-xl border">

            <span className="bg-gray-100 px-4 py-3 text-gray-500">
              vendora.com/store/
            </span>

            <input
              value={data.slug}
              onChange={(e) => {
                setSlugEdited(true);

                update({
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/\s+/g, "-"),
                });
              }}
              className="flex-1 p-3 outline-none"
            />

          </div>

<p className="mt-2 text-sm">

  {checking && (
    <span className="text-gray-500">
      Checking availability...
    </span>
  )}

  {!checking && available === true && (
    <span className="text-emerald-600">
      ✓ Store URL is available
    </span>
  )}

  {!checking && available === false && (
    <span className="text-red-600">
      ✗ Store URL is already taken
    </span>
  )}

</p>
        </div>

      </div>
 <div>
  <label className="mb-2 block font-medium">
    Store Currency
  </label>

  <select
    value={data.currency}
    onChange={(e) =>
      update({
        currency: e.target.value,
      })
    }
    className="w-full rounded-xl border p-3 outline-none focus:border-emerald-600"
  >
    <option value="NGN">🇳🇬 Nigerian Naira (₦)</option>
    <option value="USD">🇺🇸 US Dollar ($)</option>
    <option value="GHS">🇬🇭 Ghana Cedi (GH₵)</option>
    <option value="KES">🇰🇪 Kenyan Shilling (KSh)</option>
    <option value="ZAR">🇿🇦 South African Rand (R)</option>
    <option value="GBP">🇬🇧 Pound Sterling (£)</option>
    <option value="EUR">🇪🇺 Euro (€)</option>
  </select>

  <p className="mt-2 text-sm text-gray-500">
    This is the currency customers will see in your store.
  </p>
</div>
<div className="mt-10 flex justify-between">

        <button
          onClick={back}
          className="rounded-xl border px-6 py-3"
        >
          Back
        </button>

        <button
          onClick={handleNext}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
        >
          Continue
        </button>

      </div>

    </div>
  );
}
