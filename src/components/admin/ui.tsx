"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children = "Сохранить",
  variant = "primary",
}: {
  children?: React.ReactNode;
  variant?: "primary" | "danger";
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-11 items-center justify-center rounded-lg px-6 font-medium transition disabled:opacity-60 ${
        variant === "danger"
          ? "border border-line text-ink-soft hover:border-accent hover:text-accent"
          : "bg-accent text-white hover:bg-accent-hover"
      }`}
    >
      {pending ? "Сохраняем…" : children}
    </button>
  );
}

/** Кнопка удаления — спрашивает подтверждение перед отправкой формы. */
export function DeleteButton({
  label = "Удалить",
  confirmText,
}: {
  label?: string;
  confirmText: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
      className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-medium text-ink-soft transition hover:border-accent hover:text-accent disabled:opacity-60"
    >
      {pending ? "Удаляем…" : label}
    </button>
  );
}

export function Labeled({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-ink-faint">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[var(--color-accent)]"
      />
      {label}
    </label>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex h-11 items-center rounded-lg bg-accent px-5 font-medium text-white transition hover:bg-accent-hover"
        >
          {action.label}
        </Link>
      )}
    </header>
  );
}

export function FormMessage({
  state,
}: {
  state: { ok: boolean; message: string } | null;
}) {
  if (!state) return null;
  return (
    <p
      className={`rounded-lg px-4 py-3 text-sm ${
        state.ok
          ? "bg-emerald-50 text-emerald-700"
          : "bg-accent-soft text-accent"
      }`}
    >
      {state.message}
    </p>
  );
}
