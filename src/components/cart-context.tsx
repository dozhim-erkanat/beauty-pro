"use client";

import { useSyncExternalStore } from "react";
import {
  addItem,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeItem,
  setItemQuantity,
  subscribe,
  type CartItem,
} from "@/lib/cart-store";

export type { CartItem };

/** Состояние корзины из внешнего стора + операции над ней. */
export function useCart() {
  const { items, ready } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    items,
    ready,
    count: items.reduce((sum, i) => sum + i.quantity, 0),
    /** Сумма позиций с ценой; товары «по запросу» не учитываются. */
    total: items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0),
    hasOnRequest: items.some((i) => i.price === null),
    add: addItem,
    setQuantity: setItemQuantity,
    remove: removeItem,
    clear: clearCart,
  };
}
