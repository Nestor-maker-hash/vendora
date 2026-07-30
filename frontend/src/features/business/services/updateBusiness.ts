import { supabase } from "@/src/lib/supabase";

interface UpdateBusinessData {
  id: string;

  name: string;
  slug: string;
  
  phone?: string;

  description?: string;

  logo_url?: string;
  banner_url?: string;
}

export async function updateBusiness(
  data: UpdateBusinessData
) {
  const response = await supabase
    .from("businesses")
    .update({
      name: data.name,
      slug: data.slug,
      phone: data.phone,
      currency: data.currency,
      description: data.description,
      logo_url: data.logo_url,
      banner_url: data.banner_url,
    })
    .eq("id", data.id)
    .select();


  if (response.error) {
    throw response.error;
  }
}
