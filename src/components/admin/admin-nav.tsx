"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/admin", label: "Сводка", exact: true },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/brands", label: "Бренды" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/settings", label: "Настройки" },
];

export function AdminNav({
  email,
  signOutAction,
}: {
  email: string;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-line bg-surface lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between p-4 lg:block">
        <Link href="/admin" className="text-lg font-semibold text-ink">
          Админ-панель
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink lg:hidden"
          aria-expanded={open}
        >
          Меню
        </button>
      </div>

      <div className={`px-3 pb-4 lg:block ${open ? "block" : "hidden"}`}>
        <div className="grid gap-0.5 text-sm">
          {LINKS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-ink-soft hover:bg-surface-alt"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 border-t border-line pt-4">
          <Link
            href="/"
            target="_blank"
            className="block rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-surface-alt"
          >
            Открыть сайт ↗
          </Link>
          <div className="mt-2 truncate px-3 text-xs text-ink-faint">{email}</div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-ink-soft transition hover:bg-surface-alt hover:text-accent"
            >
              Выйти
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
