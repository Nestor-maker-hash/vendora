import { supabase } from "@/src/lib/supabase";

export async function loginWithGoogle() {
  const redirectTo =
    `${window.location.origin}/auth/callback`;

  const { error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

  if (error) {
    throw error;
  }
}
