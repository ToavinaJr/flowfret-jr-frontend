import { GRAPHQL_URL } from "@/services/backend";
import { getAccessToken } from "@/services/authToken";

export async function uploadImages(files: File[]): Promise<Array<{ id: string; storagePath: string }>> {
  if (!files.length || files.length > 12) throw new Error("Sélectionnez entre 1 et 12 images.");
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (files.some((file) => !allowed.has(file.type) || file.size > 8 * 1024 * 1024)) throw new Error("Images JPEG, PNG ou WebP uniquement, 8 Mo maximum.");
  const form = new FormData();
  files.forEach((file) => form.append("images", file));
  const token = getAccessToken();
  if (!token) throw new Error("Authentication required.");
  const uploadUrl = GRAPHQL_URL.replace(/\/graphql\/?$/, "/uploads/images");
  if (uploadUrl === GRAPHQL_URL) throw new Error("Invalid backend upload URL.");
  const response = await fetch(uploadUrl, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message;
    throw new Error(message || `Image upload failed (${response.status}).`);
  }
  const payload = await response.json() as Array<{ id: string; storagePath: string }>;
  if (!Array.isArray(payload) || payload.length !== files.length) throw new Error("The backend returned an invalid upload response.");
  return payload;
}
