import { supabase } from "@/src/lib/supabase";
import { Product } from "../types/product";

export async function getProductById(
  id: string
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data as Product;
}
