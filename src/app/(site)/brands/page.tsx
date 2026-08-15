import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBrands, getCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Бренды",
  description: "Бренды профессионального оборудования и косметики в каталоге.",
};

export default async function BrandsPage() {
  const [brands, categories] = await Promise.all([getBrands(), getCategories()]);

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Бренды</h1>
      <p className="mt-2 text-ink-soft">
        {brands.length > 0
          ? "Выберите бренд, чтобы посмотреть его категории и товары."
          : "Бренды пока не добавлены."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => {
          const brandCategories = categories.filter((c) => c.brand_id === brand.id);
          return (
            <div
              key={brand.id}
              className="rounded-card border border-line bg-surface p-6"
            >
              <Link href={`/brands/${brand.slug}`} className="group flex items-center gap-3">
                {brand.logo_url && (
                  <Image
                    src={brand.logo_url}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-lg object-contain"
                  />
                )}
                <span className="text-lg font-semibold text-ink transition group-hover:text-accent">
                  {brand.name}
                </span>
              </Link>
              {brand.description && (
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {brand.description}
                </p>
              )}
              {brandCategories.length > 0 && (
                <div className="mt-4 grid gap-1.5 text-sm">
                  {brandCategories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/catalog?brand=${brand.slug}&category=${c.slug}`}
                      className="text-ink-soft transition hover:text-accent"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
