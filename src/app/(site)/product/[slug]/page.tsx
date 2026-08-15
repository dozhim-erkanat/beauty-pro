import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { LeadForm } from "@/components/lead-form";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.name,
    description: product.short_description ?? product.description ?? undefined,
    openGraph: product.images[0] ? { images: [product.images[0]] } : undefined,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const discount =
    product.old_price && product.price && product.old_price > product.price
      ? Math.round((1 - product.price / product.old_price) * 100)
      : null;

  return (
    <div className="container-page py-12">
      <nav className="text-sm text-ink-faint">
        <Link href="/" className="transition hover:text-accent">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="transition hover:text-accent">
          Каталог
        </Link>
        {product.brand && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/brands/${product.brand.slug}`}
              className="transition hover:text-accent"
            >
              {product.brand.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          {product.brand && (
            <Link
              href={`/brands/${product.brand.slug}`}
              className="text-xs font-medium uppercase tracking-wider text-ink-faint transition hover:text-accent"
            >
              {product.brand.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-faint">
            {product.sku && <span>Артикул: {product.sku}</span>}
            <span
              className={product.in_stock ? "text-emerald-600" : "text-ink-faint"}
            >
              {product.in_stock ? "В наличии" : "Под заказ"}
            </span>
          </div>

          {product.short_description && (
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              {product.short_description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap items-end gap-3">
            <div className="text-3xl font-semibold text-ink">
              {formatPrice(product.price)}
            </div>
            {product.old_price && product.price && product.old_price > product.price && (
              <>
                <div className="pb-1 text-lg text-ink-faint line-through">
                  {formatPrice(product.old_price)}
                </div>
                <div className="mb-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
                  −{discount}%
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton
              item={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0] ?? null,
              }}
            />
            <LeadForm productId={product.id} productName={product.name} />
          </div>

          {product.specs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold text-ink">Характеристики</h2>
              <dl className="mt-3 divide-y divide-line border-y border-line">
                {product.specs.map((spec, i) => (
                  <div
                    key={`${spec.name}-${i}`}
                    className="flex justify-between gap-6 py-2.5 text-sm"
                  >
                    <dt className="text-ink-soft">{spec.name}</dt>
                    <dd className="text-right font-medium text-ink">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      {product.description && (
        <section className="mt-14 max-w-3xl">
          <h2 className="text-lg font-semibold text-ink">Описание</h2>
          <div className="mt-3 space-y-4 leading-relaxed text-ink-soft">
            {product.description.split(/\n{2,}/).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-semibold text-ink">Похожие товары</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
