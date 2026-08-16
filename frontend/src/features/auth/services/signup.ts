import { supabase } from "@/src/lib/supabase";

export async function signup(
  email: string,
  password: string,
  fullName: string
) {
  console.log("signup.ts: calling Supabase");

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

  console.log("signup.ts: Supabase response", {
    data,
    error,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error(
      "Account creation did not return a user."
    );
  }

  return data.user;
}
