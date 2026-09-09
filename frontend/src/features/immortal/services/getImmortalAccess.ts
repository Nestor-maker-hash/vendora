import { redirect } from "next/navigation";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";

export async function getImmortalAccess() {
  const supabase = await createSupabaseServerAuthClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "super_admin") {
    redirect("/dashboard");
  }

  return {
    user,
    profile,
  };
}
