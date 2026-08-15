"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center rounded-card border border-line bg-surface-alt text-sm text-ink-faint">
        Фото не добавлено
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-card border border-line bg-surface-alt">
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              className={`relative h-20 w-20 overflow-hidden rounded-lg border transition ${
                i === active ? "border-accent" : "border-line hover:border-ink/30"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
