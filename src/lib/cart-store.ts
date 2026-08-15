export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number | null;
  image: string | null;
  quantity: number;
};

export type CartSnapshot = {
  items: CartItem[];
  /** false до того, как корзина прочитана из localStorage (первый рендер). */
  ready: boolean;
};

const STORAGE_KEY = "beautypro.cart.v1";

/**
 * Корзина живёт в модуле, а не в React-состоянии: компоненты подписываются
 * через useSyncExternalStore. Так на сервере и при первом рендере снапшот
 * пустой (разметка совпадает), а localStorage читается уже после гидратации.
 */
const EMPTY: CartSnapshot = { items: [], ready: false };

let snapshot: CartSnapshot = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.items));
  } catch {
    // Приватный режим браузера — корзина просто не переживёт перезагрузку.
  }
}

function isCartItem(value: unknown): value is CartItem {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as CartItem).id === "string" &&
    typeof (value as CartItem).slug === "string" &&
    typeof (value as CartItem).name === "string" &&
    typeof (value as CartItem).quantity === "number"
  );
}

function load() {
  loaded = true;
  let items: CartItem[] = [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed.filter(isCartItem);
  } catch {
    items = [];
  }
  snapshot = { items, ready: true };
  emit();
}

function update(items: CartItem[]) {
  snapshot = { items, ready: true };
  persist();
  emit();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) load();
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): CartSnapshot {
  return snapshot;
}

export function getServerSnapshot(): CartSnapshot {
  return EMPTY;
}

export function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
  const existing = snapshot.items.find((i) => i.id === item.id);
  update(
    existing
      ? snapshot.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
        )
      : [...snapshot.items, { ...item, quantity }],
  );
}

export function setItemQuantity(id: string, quantity: number) {
  update(
    quantity <= 0
      ? snapshot.items.filter((i) => i.id !== id)
      : snapshot.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
  );
}

export function removeItem(id: string) {
  update(snapshot.items.filter((i) => i.id !== id));
}

export function clearCart() {
  update([]);
}
