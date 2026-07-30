import { supabase } from "@/src/lib/supabase";
import { Product } from "../types/product";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getProducts(): Promise<Product[]> {
  const business = await getCurrentBusiness();

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

  return (products ?? []) as Product[];
}
