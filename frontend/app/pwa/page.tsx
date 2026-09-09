import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";
import { getBusinessAfterLogin } from "@/src/features/auth/services/getBusinessAfterLogin";

export default async function PWALauncher() {
  const supabase = await createSupabaseServerAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/marketplace");
  }

  const business = await getBusinessAfterLogin(user.id);

  if (!business) {
    redirect("/marketplace");
  }

  const cookieStore = await cookies();
  const lastContext =
    cookieStore.get("vendora:last-context")?.value;

  if (lastContext === "business") {
    redirect("/dashboard");
  }

  redirect("/marketplace");
}
