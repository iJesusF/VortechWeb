import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any; // Type cast to avoid strict Supabase generic inference issues; runtime types are safe
}
