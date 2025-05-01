import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value;
        },
        async set(name: string, value: string, options: any) {
          try {
            (await cookieStore).set(name, value, options);
          } catch (error) {
            // This can be ignored if you have middleware
          }
        },
        async remove(name: string, options: any) {
          try {
            (await cookieStore).set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            // This can be ignored if you have middleware
          }
        },
      },
    }
  );
};

// Server-side Supabase operations
// Can access both auth.users and public.users
