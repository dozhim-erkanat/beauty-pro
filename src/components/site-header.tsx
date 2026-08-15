"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import type { Brand } from "@/lib/types";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Beauty Pro";

export function SiteHeader({
  brands,
  phone,
}: {
  brands: Brand[];
  phone?: string;
}) {
  const { count, ready } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Поле поиска подстраивается под адрес страницы (например, после перехода
  // по ссылке с фильтром) — корректировка состояния прямо в рендере.
  const queryFromUrl = searchParams.get("q") ?? "";
  const [lastQueryFromUrl, setLastQueryFromUrl] = useState(queryFromUrl);
  const [query, setQuery] = useState(queryFromUrl);
  if (queryFromUrl !== lastQueryFromUrl) {
    setLastQueryFromUrl(queryFromUrl);
    setQuery(queryFromUrl);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : "/catalog");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-ink"
        >
          {SITE_NAME}
        </Link>

        <nav className="ml-4 hidden items-center gap-1 text-sm lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setBrandsOpen(true)}
            onMouseLeave={() => setBrandsOpen(false)}
          >
            <Link
              href="/brands"
              className="flex items-center gap-1 rounded-md px-3 py-2 text-ink-soft transition hover:text-ink"
            >
              Бренды
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                <path
                  d="M2 4.5 6 8.5 10 4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </Link>
            {brandsOpen && brands.length > 0 && (
              <div className="absolute left-0 top-full w-60 rounded-xl border border-line bg-surface p-2 shadow-lg shadow-black/5">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${brand.slug}`}
                    className="block rounded-lg px-3 py-2 text-ink-soft transition hover:bg-surface-alt hover:text-ink"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/catalog"
            className="rounded-md px-3 py-2 text-ink-soft transition hover:text-ink"
          >
            Каталог
          </Link>
          <Link
            href="/contacts"
            className="rounded-md px-3 py-2 text-ink-soft transition hover:text-ink"
          >
            Контакты
          </Link>
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden md:block">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по каталогу"
              aria-label="Поиск по каталогу"
              className="field w-56 py-2 pl-9 lg:w-72"
            />
            <svg
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              aria-hidden
            >
              <circle
                cx="9"
                cy="9"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="m13.5 13.5 3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </form>

        {phone && (
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            className="ml-auto hidden text-sm font-medium text-ink md:ml-0 xl:block"
          >
            {phone}
          </a>
        )}

        <Link
          href="/cart"
          className="relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink transition hover:border-accent hover:text-accent md:ml-0"
          aria-label="Корзина"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.7h6.9a2 2 0 0 0 2-1.6L20 8H6.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="19" r="1.4" fill="currentColor" />
            <circle cx="17" cy="19" r="1.4" fill="currentColor" />
          </svg>
          {ready && count > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-white">
              {count}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-ink lg:hidden"
          aria-label="Меню"
          aria-expanded={menuOpen}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              d={menuOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-surface lg:hidden">
          <div className="container-page space-y-4 py-4">
            <form onSubmit={submitSearch} className="md:hidden">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по каталогу"
                aria-label="Поиск по каталогу"
                className="field"
              />
            </form>
            <div className="grid gap-1 text-sm">
              <Link
                href="/catalog"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 font-medium text-ink hover:bg-surface-alt"
              >
                Каталог
              </Link>
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-ink-soft hover:bg-surface-alt"
                >
                  {brand.name}
                </Link>
              ))}
              <Link
                href="/contacts"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 font-medium text-ink hover:bg-surface-alt"
              >
                Контакты
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
