import { supabase } from "@/src/lib/supabase";

export async function forgotPassword(
  email: string
) {
  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {

redirectTo:
  `${window.location.origin}/reset-password`,

      }
    );

  if (error) {
    throw error;
  }
}
