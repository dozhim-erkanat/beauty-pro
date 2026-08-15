import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function env() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Не заданы NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Скопируйте .env.example в .env.local и заполните.",
    );
  }
  return { url, key };
}

/**
 * Клиент Supabase для серверных компонентов, Server Actions и route handlers.
 * В Server Component запись cookie невозможна (Next 16), поэтому setAll там
 * молча игнорируется — сессию обновляет proxy.ts.
 */
export async function createClient() {
  const { url, key } = env();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Вызов из Server Component — игнорируем, сессию продлевает proxy.
        }
      },
    },
  });
}
