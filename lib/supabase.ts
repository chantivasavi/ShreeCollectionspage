import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Saree = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  image_url: string | null; // cover photo (the first one)
  image_urls: string[] | null; // all photos, cover first
  available: boolean;
  created_at: string;
};

/** All photos of a saree, cover photo first. */
export function photosOf(s: Saree): string[] {
  if (s.image_urls && s.image_urls.length > 0) return s.image_urls;
  return s.image_url ? [s.image_url] : [];
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null when the env variables are not set yet, so the site still loads.
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

export async function getSarees(): Promise<Saree[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("sarees")
    .select("*")
    .order("available", { ascending: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getSaree(id: string): Promise<Saree | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("sarees").select("*").eq("id", id).maybeSingle();
  return data;
}
