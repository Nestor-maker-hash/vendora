"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  useOnboardingContext,
} from "../context/OnboardingContext";

import { finishOnboarding } from "../services/finishOnboarding";

interface Props {
  back: () => void;
}

export default function StepSocials({
  back,
}: Props) {
  const router = useRouter();

  const { data, update } =
    useOnboardingContext();

  const [loading, setLoading] =
    useState(false);

  async function handleFinish() {
    try {
      setLoading(true);

      await finishOnboarding(data);

      toast.success(
        "Welcome to Vendora!"
      );

      router.push("/dashboard");
    } catch (err) {
      console.error(err);

      toast.error(
        "Unable to finish onboarding."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>

      <h1 className="text-3xl font-bold">
        Online Presence
      </h1>

      <p className="mt-2 text-gray-500">
        These are optional.
      </p>

      <div className="mt-8 space-y-4">

        <input
          placeholder="Website"
          className="w-full rounded-xl border p-3"
          value={data.website}
          onChange={(e) =>
            update({
              website: e.target.value,
            })
          }
        />

        <input
          placeholder="Instagram"
          className="w-full rounded-xl border p-3"
          value={data.instagram}
          onChange={(e) =>
            update({
              instagram: e.target.value,
            })
          }
        />

        <input
          placeholder="Facebook"
          className="w-full rounded-xl border p-3"
          value={data.facebook}
          onChange={(e) =>
            update({
              facebook: e.target.value,
            })
          }
        />

        <input
          placeholder="Twitter / X"
          className="w-full rounded-xl border p-3"
          value={data.twitter}
          onChange={(e) =>
            update({
              twitter: e.target.value,
            })
          }
        />

      </div>

      <div className="mt-10 flex justify-between">

        <button
          onClick={back}
          className="rounded-xl border px-6 py-3"
        >
          Back
        </button>

        <button
          onClick={handleFinish}
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Finishing..."
            : "Finish"}
        </button>

      </div>

    </div>
  );
}
