import { supabase } from "@/src/lib/supabase";

export async function resendVerificationEmail(
  email: string
) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo:
        `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw error;
  }
}
