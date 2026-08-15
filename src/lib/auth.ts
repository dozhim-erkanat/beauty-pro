import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Проверка прав администратора. Админ — это любой пользователь, заведённый
 * в Supabase Auth (публичная регистрация в проекте должна быть отключена).
 *
 * Вызывать в admin-layout И в каждом Server Action: Server Actions — это
 * обычные POST-эндпоинты, до них проверка из layout не доходит.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return { supabase, user };
}

/** Текущий пользователь или null — без редиректа. */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
