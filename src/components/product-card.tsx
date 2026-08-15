import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { formatPrice } from "@/lib/format";
import type { ProductWithRefs } from "@/lib/types";

export function ProductCard({ product }: { product: ProductWithRefs }) {
  const image = product.images[0] ?? null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition hover:border-ink/20 hover:shadow-lg hover:shadow-black/5">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-4/3 overflow-hidden bg-surface-alt"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-xs text-ink-faint">
            Нет фото
          </span>
        )}
        {product.old_price && product.price && product.old_price > product.price && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">
            Скидка
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-white">
            Под заказ
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <div className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            {product.brand.name}
          </div>
        )}
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 line-clamp-2 font-medium leading-snug text-ink transition group-hover:text-accent"
        >
          {product.name}
        </Link>
        {product.short_description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">
            {product.short_description}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <div className="font-semibold text-ink">
              {formatPrice(product.price)}
            </div>
            {product.old_price && product.price && product.old_price > product.price && (
              <div className="text-sm text-ink-faint line-through">
                {formatPrice(product.old_price)}
              </div>
            )}
          </div>
          <AddToCartButton
            compact
            item={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image,
            }}
          />
        </div>
      </div>
    </article>
  );
}
