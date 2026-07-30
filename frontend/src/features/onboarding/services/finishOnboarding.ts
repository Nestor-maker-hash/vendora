import { createOrUpdateBusiness } from "@/src/features/business/services/createOrUpdateBusiness";

import { createFreeSubscription } from "@/src/features/subscriptions/services/createFreeSubscription";

import { getCurrentSubscription } from "@/src/features/subscriptions/services/getCurrentSubscription";

import { initializeNotificationSettings } from "@/src/features/notifications/services/initializeNotificationSettings";

import { OnboardingData } from "../hooks/useOnboarding";

export async function finishOnboarding(
  data: OnboardingData
) {
  const businessId =
    await createOrUpdateBusiness(data);

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

  return businessId;
}
