// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON;

if (!url) console.error("❌ Missing VITE_SUPABASE_URL");
if (!anon) console.error("❌ Missing VITE_SUPABASE_ANON");

export const supabase = createClient(url!, anon!);
