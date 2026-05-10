/**
 * Supabase client for the WEBSITE project (separate from the LMS database).
 * Uses the service-role key so it can bypass RLS and perform upserts.
 *
 * Required env vars:
 *   WEBSITE_SUPABASE_URL        — project URL of the website Supabase project
 *   WEBSITE_SUPABASE_SERVICE_KEY — service-role key (not the anon key)
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.WEBSITE_SUPABASE_URL;
const key = process.env.WEBSITE_SUPABASE_SERVICE_KEY;

if (!url || !key) {
  // Warn at import time so it surfaces immediately in logs rather than at push time.
  console.warn(
    "[websiteSupabase] WEBSITE_SUPABASE_URL or WEBSITE_SUPABASE_SERVICE_KEY is not set. " +
      "Push-to-website calls will fail until these are configured."
  );
}

export const websiteSupabase = createClient(url ?? "", key ?? "");
