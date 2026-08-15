import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "@/components/catalog-filters";
import { CatalogSort } from "@/components/catalog-sort";
import { ProductCard } from "@/components/product-card";
import { getBrands, getCatalog, getCategories } from "@/lib/queries";
import type { CatalogFilters as Filters } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Каталог",
  description:
    "Каталог профессионального оборудования и косметики: фильтры по бренду, категории и цене.",
};

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() || undefined;
}

function toInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

const SORTS = new Set(["new", "price_asc", "price_desc", "name"]);

export default async function CatalogPage({
  searchParams,
}: PageProps<"/catalog">) {
  const sp = await searchParams;

  const sortParam = first(sp.sort);
  const filters: Filters = {
    q: first(sp.q),
    brand: first(sp.brand),
    category: first(sp.category),
    minPrice: toInt(first(sp.min)),
    maxPrice: toInt(first(sp.max)),
    sort: sortParam && SORTS.has(sortParam) ? (sortParam as Filters["sort"]) : undefined,
    page: toInt(first(sp.page)) || 1,
  };

  const [brands, categories, catalog] = await Promise.all([
    getBrands(),
    getCategories(),
    getCatalog(filters),
  ]);

  /** Ссылка на страницу N с сохранением текущих фильтров. */
  function pageHref(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(sp)) {
      const v = first(value);
      if (v && key !== "page") params.set(key, v);
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  }

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Каталог</h1>
      <p className="mt-2 text-ink-soft">
        {filters.q
          ? `Результаты поиска «${filters.q}» — найдено ${catalog.total}`
          : `Товаров в каталоге: ${catalog.total}`}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <CatalogFilters
          brands={brands}
          categories={categories}
          activeBrand={filters.brand ?? null}
        />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <span className="text-sm text-ink-faint">
              {catalog.pageCount > 1
                ? `Страница ${catalog.page} из ${catalog.pageCount}`
                : ` `}
            </span>
            <CatalogSort />
          </div>

          {catalog.products.length === 0 ? (
            <div className="rounded-card border border-dashed border-line py-20 text-center">
              <p className="font-medium text-ink">Ничего не найдено</p>
              <p className="mt-1 text-sm text-ink-soft">
                Попробуйте изменить фильтры или поисковый запрос.
              </p>
              <Link
                href="/catalog"
                className="mt-4 inline-flex h-10 items-center rounded-lg border border-line px-5 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
              >
                Сбросить фильтры
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {catalog.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {catalog.pageCount > 1 && (
            <nav className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: catalog.pageCount }, (_, i) => i + 1).map(
                (page) => (
                  <Link
                    key={page}
                    href={pageHref(page)}
                    className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm transition ${
                      page === catalog.page
                        ? "bg-accent font-medium text-white"
                        : "border border-line text-ink-soft hover:border-accent hover:text-accent"
                    }`}
                  >
                    {page}
                  </Link>
                ),
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
