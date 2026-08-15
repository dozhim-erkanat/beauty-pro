"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { createOrder } from "@/app/actions";
import { useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/format";

const EMPTY_CUSTOMER = { name: "", phone: "", email: "", comment: "" };

export function CartView() {
  const { items, total, count, hasOnRequest, ready, setQuantity, remove, clear } =
    useCart();
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createOrder(
        customer,
        items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      );
      if (result.ok) {
        setOrderNumber(result.orderNumber);
        clear();
        setCustomer(EMPTY_CUSTOMER);
      } else {
        setError(result.message);
      }
    });
  }

  if (orderNumber !== null) {
    return (
      <div className="mt-10 max-w-lg rounded-card border border-line bg-surface-alt p-8">
        <h2 className="text-xl font-semibold text-ink">
          Заказ №{orderNumber} принят
        </h2>
        <p className="mt-2 text-ink-soft">
          Менеджер свяжется с вами в ближайшее время для подтверждения.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex h-11 items-center rounded-lg bg-accent px-6 font-medium text-white transition hover:bg-accent-hover"
        >
          Продолжить покупки
        </Link>
      </div>
    );
  }

  if (!ready) {
    return <div className="mt-10 h-40 animate-pulse rounded-card bg-surface-alt" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-card border border-dashed border-line py-20 text-center">
        <p className="font-medium text-ink">В корзине пока пусто</p>
        <p className="mt-1 text-sm text-ink-soft">
          Добавьте товары из каталога, чтобы оформить заказ.
        </p>
        <Link
          href="/catalog"
          className="mt-5 inline-flex h-11 items-center rounded-lg bg-accent px-6 font-medium text-white transition hover:bg-accent-hover"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="divide-y divide-line rounded-card border border-line">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4">
            <Link
              href={`/product/${item.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface-alt"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-[11px] text-ink-faint">
                  Нет фото
                </span>
              )}
            </Link>

            <div className="flex flex-1 flex-col">
              <Link
                href={`/product/${item.slug}`}
                className="font-medium text-ink transition hover:text-accent"
              >
                {item.name}
              </Link>
              <div className="mt-1 text-sm text-ink-soft">
                {formatPrice(item.price)}
              </div>

              <div className="mt-auto flex items-center gap-3 pt-3">
                <div className="flex h-9 items-center rounded-lg border border-line">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, item.quantity - 1)}
                    aria-label="Уменьшить количество"
                    className="h-full w-9 text-ink-soft transition hover:text-accent"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.id, item.quantity + 1)}
                    aria-label="Увеличить количество"
                    className="h-full w-9 text-ink-soft transition hover:text-accent"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-sm text-ink-faint transition hover:text-accent"
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className="hidden w-32 shrink-0 text-right font-semibold text-ink sm:block">
              {item.price === null
                ? "По запросу"
                : formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="rounded-card border border-line bg-surface-alt p-6"
      >
        <h2 className="text-lg font-semibold text-ink">Оформление заказа</h2>

        <div className="mt-4 space-y-1 border-b border-line pb-4 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Товаров</span>
            <span>{count} шт.</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-ink">
            <span>Итого</span>
            <span>{formatPrice(total)}</span>
          </div>
          {hasOnRequest && (
            <p className="pt-2 text-xs text-ink-faint">
              В заказе есть товары с ценой по запросу — менеджер сообщит их
              стоимость отдельно.
            </p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <input
            required
            value={customer.name}
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
            placeholder="Ваше имя"
            autoComplete="name"
            className="field"
          />
          <input
            required
            type="tel"
            value={customer.phone}
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            placeholder="Телефон"
            autoComplete="tel"
            className="field"
          />
          <input
            type="email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            placeholder="Email (необязательно)"
            autoComplete="email"
            className="field"
          />
          <textarea
            rows={3}
            value={customer.comment}
            onChange={(e) => setCustomer({ ...customer, comment: e.target.value })}
            placeholder="Комментарий к заказу"
            className="field resize-none"
          />
        </div>

        {error && <p className="mt-3 text-sm text-accent">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 h-12 w-full rounded-lg bg-accent font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Отправляем…" : "Оформить заказ"}
        </button>
        <p className="mt-3 text-xs text-ink-faint">
          Оплата не производится на сайте — менеджер свяжется для подтверждения.
        </p>
      </form>
    </div>
  );
}
