"use client";

import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";

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

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [uploadingBanner, setUploadingBanner] =
    useState(false);

  const uploading =
    uploadingLogo || uploadingBanner;

  async function uploadLogo(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingLogo(true);

      const url =
        await uploadBusinessImage(
          file,
          "logos"
        );

      update({
        logo_url: url,
      });

      toast.success("Logo uploaded.");
    } catch (error) {
      console.error(
        "Logo upload failed:",
        error
      );

      toast.error(
        "Unable to upload your logo."
      );
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  }

  async function uploadBanner(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploadingBanner(true);

      const url =
        await uploadBusinessImage(
          file,
          "banners"
        );

      update({
        banner_url: url,
      });

      toast.success("Banner uploaded.");
    } catch (error) {
      console.error(
        "Banner upload failed:",
        error
      );

      toast.error(
        "Unable to upload your banner."
      );
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
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
              alt="Business logo"
              className="mb-4 h-24 w-24 rounded-full border object-cover"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={uploadLogo}
            disabled={uploading}
          />

          {uploadingLogo && (
            <p className="mt-2 text-sm text-gray-500">
              Uploading logo...
            </p>
          )}
        </div>

        <div>
          <label className="mb-3 block font-medium">
            Store Banner
          </label>

          {data.banner_url && (
            <img
              src={data.banner_url}
              alt="Store banner"
              className="mb-4 h-40 w-full rounded-xl border object-cover"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={uploadBanner}
            disabled={uploading}
          />

          {uploadingBanner && (
            <p className="mt-2 text-sm text-gray-500">
              Uploading banner...
            </p>
          )}
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <button
          onClick={back}
          disabled={uploading}
          className="rounded-xl border px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        <button
          onClick={next}
          disabled={uploading}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
