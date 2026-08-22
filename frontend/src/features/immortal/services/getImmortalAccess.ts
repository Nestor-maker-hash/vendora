import { redirect } from "next/navigation";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";

export async function getImmortalAccess() {
  const supabase = await createSupabaseServerAuthClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("IMMORTAL AUTH CHECK:", {
    hasUser: !!user,
    userId: user?.id,
    userError: userError?.message,
  });

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  console.log("IMMORTAL PROFILE CHECK:", {
    userId: user.id,
    profile,
    profileError: profileError?.message,
  });

  if (profileError || profile?.role !== "super_admin") {
    redirect("/dashboard");
  }

  return {
    user,
    profile,
  };
}
