import { supabase } from "@/src/lib/supabase";

export async function uploadBusinessImage(
  file: File,
  folder: "logos" | "banners"
) {
  const extension = file.name.split(".").pop();

  const fileName =
    `${folder}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("business-assets")
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("business-assets")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
