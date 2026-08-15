import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getBrands, getCategories, getFeaturedProducts } from "@/lib/queries";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Beauty Pro";

export default async function HomePage() {
  const [brands, featured, categories] = await Promise.all([
    getBrands(),
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <>
      <section className="border-b border-line bg-surface-alt">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
              Профессиональное оборудование
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-ink md:text-5xl">
              {SITE_NAME} — всё для салона красоты
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
              Аппараты, расходные материалы и профессиональная косметика от
              проверенных брендов. Консультация, доставка и сервис.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex h-12 items-center rounded-lg bg-accent px-7 font-medium text-white transition hover:bg-accent-hover"
              >
                Смотреть каталог
              </Link>
              <Link
                href="/brands"
                className="inline-flex h-12 items-center rounded-lg border border-line bg-surface px-7 font-medium text-ink transition hover:border-ink/30"
              >
                Бренды
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featured.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="relative aspect-4/3 overflow-hidden rounded-card border border-line bg-surface"
              >
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 260px, 45vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-3 text-center text-sm text-ink-faint">
                    {product.name}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {brands.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Бренды
            </h2>
            <Link
              href="/brands"
              className="text-sm font-medium text-accent transition hover:text-accent-hover"
            >
              Все бренды →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.slice(0, 6).map((brand) => {
              const brandCategories = categories.filter(
                (c) => c.brand_id === brand.id,
              );
              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group rounded-card border border-line bg-surface p-6 transition hover:border-ink/20 hover:shadow-lg hover:shadow-black/5"
                >
                  <div className="flex items-center gap-3">
                    {brand.logo_url && (
                      <Image
                        src={brand.logo_url}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-contain"
                      />
                    )}
                    <div className="text-lg font-semibold text-ink transition group-hover:text-accent">
                      {brand.name}
                    </div>
                  </div>
                  {brand.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-ink-soft">
                      {brand.description}
                    </p>
                  )}
                  {brandCategories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {brandCategories.slice(0, 4).map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-ink-soft"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="border-t border-line bg-surface-alt py-16">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                Популярные товары
              </h2>
              <Link
                href="/catalog"
                className="text-sm font-medium text-accent transition hover:text-accent-hover"
              >
                Весь каталог →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
