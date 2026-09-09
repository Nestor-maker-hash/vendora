import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { getPostOnboardingStatus } from "@/src/features/onboarding/services/getPostOnboardingStatus";

export default async function OnboardingSetupPage() {
  const status = await getPostOnboardingStatus();

  if (!status.productReady) {
    redirect("/products/new?setup=true");
  }

  if (!status.deliveryReady) {
    redirect("/settings?section=delivery&setup=true");
  }

  if (!status.paymentReady) {
    redirect("/settings?section=payments&setup=true");
  }

  redirect("/dashboard");
}
