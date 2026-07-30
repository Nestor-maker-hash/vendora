"use client";

import { ChangeEvent } from "react";

import {
  useOnboardingContext,
} from "../context/OnboardingContext";

import { uploadBusinessImage } from "@/src/features/business/services/uploadBusinessImage";

interface Props {
  back: () => void;
  next: () => void;
}

export default function StepBranding({
  back,
  next,
}: Props) {
  const { data, update } =
    useOnboardingContext();

  async function uploadLogo(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

const url = await uploadBusinessImage(file, "logos");

    update({
      logo_url: url,
    });
  }

  async function uploadBanner(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

const url = await uploadBusinessImage(file, "banners");

    update({
      banner_url: url,
    });
  }

  return (
    <div>

      <h1 className="text-3xl font-bold">
        Branding
      </h1>

      <p className="mt-2 text-gray-500">
        Add your logo and banner.
        You can also skip this step and
        update them later.
      </p>

      <div className="mt-8 space-y-8">
<div>

          <label className="mb-3 block font-medium">
            Business Logo
          </label>

          {data.logo_url && (
            <img
              src={data.logo_url}
              alt="Logo"
              className="mb-4 h-24 w-24 rounded-full border object-cover"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={uploadLogo}
          />

        </div>
<div>

          <label className="mb-3 block font-medium">
            Store Banner
          </label>

          {data.banner_url && (
            <img
              src={data.banner_url}
              alt="Banner"
              className="mb-4 h-40 w-full rounded-xl border object-cover"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={uploadBanner}
          />

        </div>
</div>

      <div className="mt-10 flex justify-between">

        <button
          onClick={back}
          className="rounded-xl border px-6 py-3"
        >
          Back
        </button>

        <button
          onClick={next}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
        >
          Continue
        </button>

      </div>

    </div>
  );
}
