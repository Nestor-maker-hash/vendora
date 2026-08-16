"use client";

import { useState } from "react";

import StepBusiness from "./StepBusiness";
import StepBranding from "./StepBranding";
import StepStore from "./StepStore";
import StepLocation from "./StepLocation";

import {
  OnboardingProvider,
} from "../context/OnboardingContext";

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);

  return (
    <OnboardingProvider>

      <main className="min-h-screen bg-slate-50 py-12">

        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl">

          <div className="mb-10">

            <p className="text-sm font-medium text-emerald-600">
              Step {step} of 4
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{
                  width: `${step * 25}%`,
                }}
              />

            </div>

          </div>

          {step === 1 && (
            <StepBusiness
              next={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepBranding
              back={() => setStep(1)}
              next={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <StepStore
              back={() => setStep(2)}
              next={() => setStep(4)}
            />
          )}

          {step === 4 && (
            <StepLocation
              back={() => setStep(3)}
            />
          )}

        </div>

      </main>

    </OnboardingProvider>
  );
}
