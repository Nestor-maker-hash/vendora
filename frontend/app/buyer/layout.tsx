import { redirect } from "next/navigation";
import { createSupabaseServerAuthClient } from "@/src/lib/supabaseServerAuth";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/buyer");
  }

  return (
    <div className="pb-16 lg:pb-0">
      {children}
    </div>
  );
}
