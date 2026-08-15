import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/category-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Brand, Category } from "@/lib/types";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("*").eq("id", id).maybeSingle(),
    supabase.from("brands").select("*").order("name"),
  ]);

  if (!data) notFound();
  const category = data as Category;

  return (
    <div>
      <AdminHeader title={category.name} description="Редактирование категории" />
      <CategoryForm
        category={category}
        brands={(brands as Brand[] | null) ?? []}
      />
    </div>
  );
}
