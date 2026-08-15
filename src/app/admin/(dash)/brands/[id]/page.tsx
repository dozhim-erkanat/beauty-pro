import { notFound } from "next/navigation";
import { BrandForm } from "@/components/admin/brand-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Brand } from "@/lib/types";

export default async function EditBrandPage({
  params,
}: PageProps<"/admin/brands/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const brand = data as Brand;

  return (
    <div>
      <AdminHeader title={brand.name} description="Редактирование бренда" />
      <BrandForm brand={brand} />
    </div>
  );
}
