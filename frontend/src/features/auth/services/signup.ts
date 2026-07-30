import { supabase } from "@/src/lib/supabase";

export async function signup(
  email: string,
  password: string,
  fullName: string
) {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
emailRedirectTo:
  `${window.location.origin}/login`,

        data: {
          full_name: fullName,
        },
      },
    });

  if (error) {
    throw error;
  }

  return data.user;
}
