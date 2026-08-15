"use client";

import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

/**
 * Селект статуса, который сразу отправляет форму — отдельная кнопка «сохранить»
 * для одного поля только мешает.
 */
export function StatusSelect({
  action,
  id,
  status,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  status: OrderStatus;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="field w-auto py-1.5 text-sm"
      >
        {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
