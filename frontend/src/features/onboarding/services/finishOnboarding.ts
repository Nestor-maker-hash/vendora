import { createOrUpdateBusiness } from "@/src/features/business/services/createOrUpdateBusiness";

import { createFreeSubscription } from "@/src/features/subscriptions/services/createFreeSubscription";

import { getCurrentSubscription } from "@/src/features/subscriptions/services/getCurrentSubscription";

import { initializeNotificationSettings } from "@/src/features/notifications/services/initializeNotificationSettings";

import { OnboardingData } from "../hooks/useOnboarding";

export async function finishOnboarding(
  data: OnboardingData
) {
  if (!data.currency) {
    throw new Error(
      "Currency must be selected before completing onboarding."
    );
  }

  const result =
    await createOrUpdateBusiness(data);

  const businessId = result.businessId;

  const subscription =
    await getCurrentSubscription(
      businessId
    );

  if (!subscription) {
    await createFreeSubscription(
      businessId
    );
  }

  await initializeNotificationSettings(
    businessId
  );

  if (result.created) {
    await fetch(
      "/api/onboarding/welcome",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          businessId,
        }),
      }
    );
  }

  return result;
}
