import Link from "next/link";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Brand, Category } from "@/lib/types";

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();

  const [{ data: categories }, { data: brands }, { data: products }] =
    await Promise.all([
      supabase.from("categories").select("*").order("sort_order").order("name"),
      supabase.from("brands").select("*").order("name"),
      supabase.from("products").select("category_id"),
    ]);

  const brandName = new Map((brands as Brand[] | null)?.map((b) => [b.id, b.name]));
  const productsByCategory = new Map<string, number>();
  for (const row of products ?? []) {
    if (!row.category_id) continue;
    productsByCategory.set(
      row.category_id,
      (productsByCategory.get(row.category_id) ?? 0) + 1,
    );
  }

  return (
    <div>
      <AdminHeader
        title="Категории"
        description="Каждая категория принадлежит одному бренду."
        action={{ href: "/admin/categories/new", label: "Добавить категорию" }}
      />

      {!brands?.length ? (
        <p className="mt-8 text-ink-soft">
          Сначала добавьте хотя бы один{" "}
          <Link href="/admin/brands/new" className="text-accent">
            бренд
          </Link>
          .
        </p>
      ) : !categories?.length ? (
        <p className="mt-8 text-ink-soft">Категорий пока нет.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-alt text-left text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Название</th>
                <th className="px-5 py-3 font-medium">Бренд</th>
                <th className="px-5 py-3 font-medium">Товаров</th>
                <th className="px-5 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(categories as Category[]).map((category) => (
                <tr key={category.id} className="transition hover:bg-surface-alt">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="font-medium text-ink transition hover:text-accent"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {brandName.get(category.brand_id) ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-soft">
                    {productsByCategory.get(category.id) ?? 0}
                  </td>
                  <td className="px-5 py-3">
                    {category.is_active ? (
                      <span className="text-emerald-600">На сайте</span>
                    ) : (
                      <span className="text-ink-faint">Скрыта</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
