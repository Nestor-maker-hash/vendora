import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { getPostOnboardingStatusServer } from "@/src/features/onboarding/services/getPostOnboardingStatusServer";

export default async function OnboardingSetupPage() {
  const status = await getPostOnboardingStatusServer();

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
