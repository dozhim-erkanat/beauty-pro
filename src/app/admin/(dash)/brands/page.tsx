import Link from "next/link";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Brand } from "@/lib/types";

export default async function AdminBrandsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: brands }, { data: counts }] = await Promise.all([
    supabase.from("brands").select("*").order("sort_order").order("name"),
    supabase.from("products").select("brand_id"),
  ]);

  const productsByBrand = new Map<string, number>();
  for (const row of counts ?? []) {
    productsByBrand.set(row.brand_id, (productsByBrand.get(row.brand_id) ?? 0) + 1);
  }

  return (
    <div>
      <AdminHeader
        title="Бренды"
        description="Верхний уровень каталога. Внутри бренда — категории, внутри категорий — товары."
        action={{ href: "/admin/brands/new", label: "Добавить бренд" }}
      />

      {!brands?.length ? (
        <p className="mt-8 text-ink-soft">
          Брендов пока нет — начните с кнопки «Добавить бренд».
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-alt text-left text-ink-soft">
              <tr>
                <th className="px-5 py-3 font-medium">Название</th>
                <th className="px-5 py-3 font-medium">Адрес</th>
                <th className="px-5 py-3 font-medium">Товаров</th>
                <th className="px-5 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(brands as Brand[]).map((brand) => (
                <tr key={brand.id} className="transition hover:bg-surface-alt">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      className="font-medium text-ink transition hover:text-accent"
                    >
                      {brand.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-faint">/{brand.slug}</td>
                  <td className="px-5 py-3 text-ink-soft">
                    {productsByBrand.get(brand.id) ?? 0}
                  </td>
                  <td className="px-5 py-3">
                    {brand.is_active ? (
                      <span className="text-emerald-600">На сайте</span>
                    ) : (
                      <span className="text-ink-faint">Скрыт</span>
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
