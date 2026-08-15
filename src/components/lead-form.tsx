"use client";

import { useActionState, useState } from "react";
import { createLead, type FormState } from "@/app/actions";

export function LeadForm({
  productId,
  productName,
}: {
  productId?: string;
  productName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createLead,
    null,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center justify-center rounded-lg border border-line px-6 font-medium text-ink transition hover:border-accent hover:text-accent"
      >
        Оставить заявку
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Заявка на товар"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-card bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">Оставить заявку</h2>
                {productName && (
                  <p className="mt-1 text-sm text-ink-soft">{productName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
                className="text-ink-faint transition hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {state?.ok ? (
              <div className="mt-6 rounded-lg bg-accent-soft p-4 text-sm text-accent">
                {state.message}
              </div>
            ) : (
              <form action={formAction} className="mt-5 space-y-3">
                <input type="hidden" name="product_id" value={productId ?? ""} />
                <input
                  type="hidden"
                  name="product_name"
                  value={productName ?? ""}
                />
                <input
                  name="name"
                  required
                  placeholder="Ваше имя"
                  autoComplete="name"
                  className="field"
                />
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="Телефон"
                  autoComplete="tel"
                  className="field"
                />
                <textarea
                  name="comment"
                  rows={3}
                  placeholder="Комментарий (необязательно)"
                  className="field resize-none"
                />

                {state && !state.ok && (
                  <p className="text-sm text-accent">{state.message}</p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="h-12 w-full rounded-lg bg-accent font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
                >
                  {pending ? "Отправляем…" : "Отправить"}
                </button>
                <p className="text-xs text-ink-faint">
                  Нажимая «Отправить», вы соглашаетесь на обработку персональных
                  данных.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
