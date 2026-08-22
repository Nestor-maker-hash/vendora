import { supabase } from "@/src/lib/supabase";
import { Product } from "../types/product";
import { checkSubscriptionLimit } from "@/src/features/subscriptions/services/checkSubscriptionLimit";

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  minimum_order_quantity?: number;
  image_url?: string;
}

export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: business, error: businessError } =
    await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .single();

  if (businessError || !business) {
    throw new Error("Business not found");
  }

  const { count: productCount, error: productCountError } =
    await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id);

  if (productCountError) {
    throw productCountError;
  }

  const productLimit = await checkSubscriptionLimit(
    business.id,
    "max_products",
    productCount ?? 0
  );

  if (!productLimit.allowed) {
    throw new Error(
      `You've reached the ${productLimit.planName} plan limit of ${productLimit.limit} products. Upgrade your plan to add more products.`
    );
  }

  const minimumOrderQuantity =
    input.minimum_order_quantity ?? 1;

  if (
    !Number.isInteger(minimumOrderQuantity) ||
    minimumOrderQuantity < 1
  ) {
    throw new Error(
      "Minimum order quantity must be a whole number of at least 1."
    );
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      business_id: business.id,
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      minimum_order_quantity: minimumOrderQuantity,
      image_url: input.image_url,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Product;
}
