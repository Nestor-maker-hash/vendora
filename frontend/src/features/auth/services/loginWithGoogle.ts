import { supabase } from "@/src/lib/supabase";

export async function loginWithGoogle(returnTo?: string) {
  const callbackUrl = new URL(
    "/auth/callback",
    window.location.origin
  );

  if (returnTo) {
    callbackUrl.searchParams.set("next", returnTo);
  }

  const { error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

  if (error) {
    throw error;
  }
}
