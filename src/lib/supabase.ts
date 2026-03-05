import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ──────────────────────────────────────────
// Server-side Supabase client (for API routes — uses anon key)
// ──────────────────────────────────────────
export function createServerSupabaseClient(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.warn("[Supabase] Missing URL or Anon Key — using seed data fallback");
        return null;
    }

    return createClient(url, anonKey);
}

// ──────────────────────────────────────────
// Clerk-Supabase Bridge
// Creates a Supabase client that injects the Clerk JWT for RLS
// ──────────────────────────────────────────
export function createClerkSupabaseClient(
    getToken: () => Promise<string | null>
): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
        console.warn("[Supabase] Missing URL or Anon Key — bridge unavailable");
        return null;
    }

    return createClient(url, anonKey, {
        global: {
            fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
                const clerkToken = await getToken();
                const headers = new Headers(init?.headers);

                if (clerkToken) {
                    headers.set("Authorization", `Bearer ${clerkToken}`);
                }

                return fetch(input, { ...init, headers });
            },
        },
    });
}

// ──────────────────────────────────────────
// React hook helper (call from a Client Component)
// Usage:
//   const { session } = useSession();
//   const supabase = createClerkSupabaseClient(
//     () => session?.getToken({ template: "supabase" }) ?? null
//   );
// ──────────────────────────────────────────
