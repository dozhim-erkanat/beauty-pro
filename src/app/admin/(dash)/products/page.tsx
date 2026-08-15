import Image from "next/image";
import Link from "next/link";
import { toggleProductActive } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import type { Brand, Product } from "@/lib/types";

const PER_PAGE = 30;

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;

  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? "";
  const brandFilter = Array.isArray(sp.brand) ? sp.brand[0] : sp.brand;
  const page = Math.max(1, Number.parseInt(String(sp.page ?? "1"), 10) || 1);

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    const term = `%${q.replace(/[%_]/g, "\\$&")}%`;
    query = query.or(`name.ilike.${term},sku.ilike.${term}`);
  }
  if (brandFilter) query = query.eq("brand_id", brandFilter);

  const from = (page - 1) * PER_PAGE;
  const [{ data: products, count }, { data: brands }] = await Promise.all([
    query.range(from, from + PER_PAGE - 1),
    supabase.from("brands").select("*").order("name"),
  ]);

  const brandName = new Map((brands as Brand[] | null)?.map((b) => [b.id, b.name]));
  const pageCount = Math.ceil((count ?? 0) / PER_PAGE);

  return (
    <div>
      <AdminHeader
        title="Товары"
        description={`Всего в каталоге: ${count ?? 0}`}
        action={{ href: "/admin/products/new", label: "Добавить товар" }}
      />

      <form className="mt-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Поиск по названию или артикулу"
          className="field max-w-xs"
        />
        <select name="brand" defaultValue={brandFilter ?? ""} className="field max-w-48">
          <option value="">Все бренды</option>
          {(brands as Brand[] | null)?.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 rounded-lg border border-line px-5 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
        >
          Найти
        </button>
      </form>

      {!brands?.length ? (
        <p className="mt-8 text-ink-soft">
          Сначала добавьте{" "}
          <Link href="/admin/brands/new" className="text-accent">
            бренд
          </Link>
          .
        </p>
      ) : !products?.length ? (
        <p className="mt-8 text-ink-soft">Товары не найдены.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-alt text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Бренд</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">На сайте</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(products as Product[]).map((product) => (
                <tr key={product.id} className="transition hover:bg-surface-alt">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-alt">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="block truncate font-medium text-ink transition hover:text-accent"
                        >
                          {product.name}
                        </Link>
                        {product.sku && (
                          <div className="text-xs text-ink-faint">{product.sku}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-soft md:table-cell">
                    {brandName.get(product.brand_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={product.id} />
                      <input
                        type="hidden"
                        name="next"
                        value={String(!product.is_active)}
                      />
                      <button
                        type="submit"
                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                          product.is_active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-surface-alt text-ink-faint hover:bg-line"
                        }`}
                      >
                        {product.is_active ? "Показан" : "Скрыт"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 && (
        <nav className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (brandFilter) params.set("brand", brandFilter);
            if (p > 1) params.set("page", String(p));
            const qs = params.toString();
            return (
              <Link
                key={p}
                href={qs ? `/admin/products?${qs}` : "/admin/products"}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm ${
                  p === page
                    ? "bg-accent font-medium text-white"
                    : "border border-line text-ink-soft hover:border-accent"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
