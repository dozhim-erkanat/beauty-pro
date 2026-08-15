import { CategoryForm } from "@/components/admin/category-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Brand } from "@/lib/types";

export default async function NewCategoryPage({
  searchParams,
}: PageProps<"/admin/categories/new">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const brandParam = Array.isArray(sp.brand) ? sp.brand[0] : sp.brand;

  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  return (
    <div>
      <AdminHeader title="Новая категория" />
      <CategoryForm
        brands={(brands as Brand[] | null) ?? []}
        defaultBrandId={brandParam}
      />
    </div>
  );
}
