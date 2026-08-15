import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getBrandBySlug, getCatalog, getCategories } from "@/lib/queries";

export async function generateMetadata({
  params,
}: PageProps<"/brands/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Бренд не найден" };
  return {
    title: brand.name,
    description: brand.description ?? `Каталог товаров бренда ${brand.name}.`,
  };
}

export default async function BrandPage({ params }: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const [categories, catalog] = await Promise.all([
    getCategories(brand.id),
    getCatalog({ brand: brand.slug }),
  ]);

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-ink-faint">
        <Link href="/" className="transition hover:text-accent">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link href="/brands" className="transition hover:text-accent">
          Бренды
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{brand.name}</span>
      </nav>

      <header className="mt-6 flex flex-wrap items-center gap-4">
        {brand.logo_url && (
          <Image
            src={brand.logo_url}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 rounded-xl border border-line object-contain p-2"
          />
        )}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            {brand.name}
          </h1>
          {brand.description && (
            <p className="mt-2 max-w-2xl text-ink-soft">{brand.description}</p>
          )}
        </div>
      </header>

      {categories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">Категории</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?brand=${brand.slug}&category=${category.slug}`}
                className="group overflow-hidden rounded-card border border-line bg-surface transition hover:border-ink/20"
              >
                {category.image_url && (
                  <div className="relative aspect-16/9 bg-surface-alt">
                    <Image
                      src={category.image_url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 280px, 45vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="font-medium text-ink transition group-hover:text-accent">
                    {category.name}
                  </div>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink">Товары бренда</h2>
          {catalog.total > catalog.products.length && (
            <Link
              href={`/catalog?brand=${brand.slug}`}
              className="text-sm font-medium text-accent transition hover:text-accent-hover"
            >
              Все {catalog.total} →
            </Link>
          )}
        </div>

        {catalog.products.length === 0 ? (
          <p className="mt-4 text-ink-soft">В этом бренде пока нет товаров.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalog.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
