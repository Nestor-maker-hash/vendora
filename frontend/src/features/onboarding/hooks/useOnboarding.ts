import { useState } from "react";

export interface OnboardingData {
  name: string;
  category: string;
  phone: string;
  email: string;

  logo_url: string;
  banner_url: string;

  description: string;
  slug: string;
  currency: string | null;

  address: string;
  state: string;
  city: string;

  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
}

const initialData: OnboardingData = {
  name: "",
  category: "",
  phone: "",
  email: "",

  logo_url: "",
  banner_url: "",

  description: "",
  slug: "",
  currency: null,
  address: "",
  state: "",
  city: "",

  website: "",
  instagram: "",
  facebook: "",
  twitter: "",
};

export function useOnboarding() {
  const [data, setData] =
    useState<OnboardingData>(initialData);

  function update(
    values: Partial<OnboardingData>
  ) {
    setData((previous) => ({
      ...previous,
      ...values,
    }));
  }

  return {
    data,
    update,
  };
}
