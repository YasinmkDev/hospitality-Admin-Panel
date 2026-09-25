import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const rawKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.length > 0 &&
  rawKey.length > 0 &&
  (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
);

// Fallback dummy URL and key prevents createClient from throwing on initialization
const supabaseUrl = isSupabaseConfigured ? rawUrl : "https://mock-instance.supabase.co";
const supabaseKey = isSupabaseConfigured ? rawKey : "mock-public-key";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: isSupabaseConfigured,
  },
});

