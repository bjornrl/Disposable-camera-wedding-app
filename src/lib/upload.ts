import { supabase } from "./supabase";

const BUCKET = "wedding-photos";

export async function uploadPhoto(
  blob: Blob,
  guestName: string,
  photoIndex: number
): Promise<string> {
  const sanitized = guestName
    .toLowerCase()
    .replace(/[^a-z0-9æøå]/gi, "-")
    .replace(/-+/g, "-");
  const timestamp = Date.now();
  const path = `${sanitized}/${timestamp}-${photoIndex}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: "image/jpeg",
      cacheControl: "3600",
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
