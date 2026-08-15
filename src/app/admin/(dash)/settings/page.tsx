import { SettingsForm } from "@/components/admin/settings-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase.from("settings").select("key,value");
  const settings: Record<string, string> = {};
  for (const row of data ?? []) settings[row.key] = row.value ?? "";

  return (
    <div>
      <AdminHeader
        title="Настройки"
        description="Контакты в шапке, подвале и на странице «Контакты»."
      />
      <SettingsForm settings={settings} />
    </div>
  );
}
