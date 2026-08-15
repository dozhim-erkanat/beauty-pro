import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Brand, Category } from "@/lib/types";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();

  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from("brands").select("*").order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!brands?.length) {
    return (
      <div>
        <AdminHeader title="Новый товар" />
        <p className="mt-8 text-ink-soft">
          Сначала добавьте{" "}
          <Link href="/admin/brands/new" className="text-accent">
            бренд
          </Link>{" "}
          — товар обязательно относится к бренду.
        </p>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Новый товар" />
      <ProductForm
        brands={brands as Brand[]}
        categories={(categories as Category[] | null) ?? []}
      />
    </div>
  );
}
