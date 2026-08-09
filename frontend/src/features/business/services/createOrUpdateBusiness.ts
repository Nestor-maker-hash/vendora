import { supabase } from "@/src/lib/supabase";

import { OnboardingData } from "@/src/features/onboarding/hooks/useOnboarding";

export async function createOrUpdateBusiness(
  data: OnboardingData
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not logged in.");
  }

  const { data: existingBusiness } =
    await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

  if (existingBusiness) {
    const { error } = await supabase
      .from("businesses")
      .update({
        ...data,
      })
      .eq("id", existingBusiness.id);

    if (error) throw error;

return {
  businessId: existingBusiness.id,
  created: false,
};
  }

  const { data: newBusiness, error } =
    await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        ...data,
      })
      .select("id")
      .single();

  if (error) throw error;

return {
  businessId: newBusiness.id,
  created: true,
};
}
