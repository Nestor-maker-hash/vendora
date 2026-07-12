import { supabase } from "@/src/lib/supabase";

interface UpdateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string | null;
}

export async function updateProduct(
  id: string,
  product: UpdateProductData
) {
  const { error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id);

  if (error) throw error;
}
