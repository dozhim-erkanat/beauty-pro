import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/login/login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-8">
        <h1 className="text-xl font-semibold text-ink">Вход в админ-панель</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Доступ только для сотрудников.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
