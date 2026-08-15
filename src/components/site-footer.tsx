import Link from "next/link";
import type { Brand } from "@/lib/types";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Beauty Pro";

export function SiteFooter({
  brands,
  settings,
}: {
  brands: Brand[];
  settings: Record<string, string>;
}) {
  return (
    <footer className="mt-auto border-t border-line bg-surface-alt">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-lg font-semibold text-ink">{SITE_NAME}</div>
          {settings.about && (
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {settings.about}
            </p>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold text-ink">Бренды</div>
          <div className="mt-3 grid gap-2 text-sm">
            {brands.slice(0, 6).map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="text-ink-soft transition hover:text-accent"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-ink">Разделы</div>
          <div className="mt-3 grid gap-2 text-sm">
            <Link href="/catalog" className="text-ink-soft transition hover:text-accent">
              Каталог
            </Link>
            <Link href="/brands" className="text-ink-soft transition hover:text-accent">
              Все бренды
            </Link>
            <Link href="/contacts" className="text-ink-soft transition hover:text-accent">
              Контакты
            </Link>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-ink">Контакты</div>
          <div className="mt-3 grid gap-2 text-sm text-ink-soft">
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
                className="transition hover:text-accent"
              >
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="transition hover:text-accent"
              >
                {settings.email}
              </a>
            )}
            {settings.address && <span>{settings.address}</span>}
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-accent"
              >
                WhatsApp
              </a>
            )}
            {settings.instagram && (
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-accent"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {SITE_NAME}. Все права защищены.
          </span>
          <Link href="/admin" className="transition hover:text-accent">
            Вход для администратора
          </Link>
        </div>
      </div>
    </footer>
  );
}
