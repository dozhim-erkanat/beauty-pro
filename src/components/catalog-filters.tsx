"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Brand, Category } from "@/lib/types";

type Props = {
  brands: Brand[];
  categories: Category[];
  /** Активный бренд-slug: категории показываем только для него. */
  activeBrand: string | null;
};

export function CatalogFilters({ brands, categories, activeBrand }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");

  const activeCategory = searchParams.get("category");

  /** Меняет параметры URL, сбрасывая пагинацию. */
  function apply(changes: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const visibleCategories = activeBrand
    ? categories.filter((c) => brands.find((b) => b.slug === activeBrand)?.id === c.brand_id)
    : [];

  const hasFilters =
    Boolean(activeBrand) ||
    Boolean(activeCategory) ||
    Boolean(searchParams.get("min")) ||
    Boolean(searchParams.get("max")) ||
    Boolean(searchParams.get("q"));

  return (
    <aside className="space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Бренд</h2>
          {hasFilters && (
            <Link
              href="/catalog"
              className="text-xs font-medium text-accent transition hover:text-accent-hover"
            >
              Сбросить
            </Link>
          )}
        </div>
        <div className="mt-3 grid gap-1 text-sm">
          <button
            type="button"
            onClick={() => apply({ brand: null, category: null })}
            className={`rounded-lg px-3 py-2 text-left transition ${
              activeBrand
                ? "text-ink-soft hover:bg-surface-alt"
                : "bg-accent-soft font-medium text-accent"
            }`}
          >
            Все бренды
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => apply({ brand: brand.slug, category: null })}
              className={`rounded-lg px-3 py-2 text-left transition ${
                activeBrand === brand.slug
                  ? "bg-accent-soft font-medium text-accent"
                  : "text-ink-soft hover:bg-surface-alt"
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </section>

      {visibleCategories.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-ink">Категория</h2>
          <div className="mt-3 grid gap-1 text-sm">
            <button
              type="button"
              onClick={() => apply({ category: null })}
              className={`rounded-lg px-3 py-2 text-left transition ${
                activeCategory
                  ? "text-ink-soft hover:bg-surface-alt"
                  : "bg-accent-soft font-medium text-accent"
              }`}
            >
              Все категории
            </button>
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => apply({ category: category.slug })}
                className={`rounded-lg px-3 py-2 text-left transition ${
                  activeCategory === category.slug
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-ink-soft hover:bg-surface-alt"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-ink">Цена, ₸</h2>
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            apply({ min: minPrice || null, max: maxPrice || null });
          }}
        >
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="от"
            aria-label="Цена от"
            className="field py-2"
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="до"
            aria-label="Цена до"
            className="field py-2"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg border border-line px-3 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
          >
            ОК
          </button>
        </form>
      </section>
    </aside>
  );
}
