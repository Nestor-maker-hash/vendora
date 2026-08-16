import { supabase } from "@/src/lib/supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function uploadBusinessImage(
  file: File,
  folder: "logos" | "banners"
) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Please upload a JPG, PNG, or WebP image."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Image must be smaller than 5MB."
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "You must be logged in to upload an image."
    );
  }

  const extensionMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension = extensionMap[file.type];

  const fileName =
    `${user.id}/${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("business-assets")
    .upload(fileName, file, {
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("business-assets")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
