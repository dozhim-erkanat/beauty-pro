"use client";

import { useState } from "react";
import { useCart, type CartItem } from "@/components/cart-context";

type Props = {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  compact?: boolean;
};

export function AddToCartButton({ item, quantity = 1, compact }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    add(item, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={`Добавить «${item.name}» в корзину`}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition ${
          added
            ? "border-accent bg-accent text-white"
            : "border-line text-ink hover:border-accent hover:text-accent"
        }`}
      >
        {added ? (
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
            <path
              d="m4.5 10.5 3.5 3.5 7.5-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
            <path
              d="M10 4.5v11M4.5 10h11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 font-medium text-white transition hover:bg-accent-hover"
    >
      {added ? "Добавлено в корзину" : "В корзину"}
    </button>
  );
}
