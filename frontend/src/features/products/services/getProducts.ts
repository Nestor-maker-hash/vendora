import { supabase } from "@/src/lib/supabase";
import { Product } from "../types/product";

export async function getProducts(): Promise<Product[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (businessError || !business) {
    throw new Error("Business not found");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return products ?? [];
}
