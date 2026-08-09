import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getUserByIdServer(
  userId: string
) {
  const { data, error } =
    await supabaseServer.auth.admin.getUserById(
      userId
    );

  if (error) {
    throw error;
  }

  return data.user;
}
