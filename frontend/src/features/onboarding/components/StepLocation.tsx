"use client";

import toast from "react-hot-toast";

import {
  useOnboardingContext,
} from "../context/OnboardingContext";

import { nigerianStates } from "@/src/constants/nigerianStates";

interface Props {
  back: () => void;
  next: () => void;
}

export default function StepLocation({
  back,
  next,
}: Props) {
  const { data, update } =
    useOnboardingContext();

  function handleNext() {
    if (!data.address.trim()) {
      toast.error(
        "Please enter your business address."
      );

      return;
    }

    if (!data.state.trim()) {
      toast.error(
        "Please select a state."
      );

      return;
    }

    if (!data.city.trim()) {
      toast.error(
        "Please enter your city."
      );

      return;
    }

    next();
  }

  return (
    <div>

      <h1 className="text-3xl font-bold">
        Business Location
      </h1>

      <p className="mt-2 text-gray-500">
        Tell customers where your business operates.
      </p>

      <div className="mt-8 space-y-6">
<div>

          <label className="mb-2 block font-medium">
            Business Address
          </label>

          <input
            value={data.address}
            onChange={(e) =>
              update({
                address: e.target.value,
              })
            }
            className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            placeholder="15 Ogui Road"
          />

        </div>
<div>

          <label className="mb-2 block font-medium">
            State
          </label>

          <select
            value={data.state}
            onChange={(e) =>
              update({
                state: e.target.value,
              })
            }
            className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
          >
            <option value="">
              Select State
            </option>

            {nigerianStates.map((state) => (
              <option
                key={state}
                value={state}
              >
                {state}
              </option>
            ))}

          </select>

        </div>
<div>

          <label className="mb-2 block font-medium">
            City
          </label>

          <input
            value={data.city}
            onChange={(e) =>
              update({
                city: e.target.value,
              })
            }
            className="w-full rounded-xl border p-4 outline-none focus:border-emerald-600"
            placeholder="Nsukka"
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
          onClick={handleNext}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white"
        >
          Continue
        </button>

      </div>

    </div>
  );
}
