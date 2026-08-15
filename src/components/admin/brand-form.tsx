"use client";

import { useActionState } from "react";
import { deleteBrand, saveBrand, type ActionState } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  Checkbox,
  DeleteButton,
  FormMessage,
  Labeled,
  SubmitButton,
} from "@/components/admin/ui";
import type { Brand } from "@/lib/types";

export function BrandForm({ brand }: { brand?: Brand }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveBrand,
    null,
  );

  return (
    <div className="mt-6 max-w-2xl space-y-6">
      <form action={formAction} className="space-y-5">
        {brand && <input type="hidden" name="id" value={brand.id} />}

        <Labeled label="Название">
          <input
            name="name"
            required
            defaultValue={brand?.name}
            className="field"
            placeholder="Например: Lumina"
          />
        </Labeled>

        <Labeled
          label="Адрес страницы (slug)"
          hint="Оставьте пустым — сгенерируем из названия. Пример: /brands/lumina"
        >
          <input
            name="slug"
            defaultValue={brand?.slug}
            className="field"
            placeholder="lumina"
          />
        </Labeled>

        <Labeled label="Описание">
          <textarea
            name="description"
            rows={3}
            defaultValue={brand?.description ?? ""}
            className="field resize-y"
          />
        </Labeled>

        <Labeled label="Логотип">
          <ImageUploader
            name="logo_url"
            folder="brands"
            defaultValue={brand?.logo_url ? [brand.logo_url] : []}
          />
        </Labeled>

        <Labeled label="Порядок сортировки" hint="Меньше — выше в списке.">
          <input
            name="sort_order"
            type="number"
            defaultValue={brand?.sort_order ?? 0}
            className="field w-32"
          />
        </Labeled>

        <Checkbox
          name="is_active"
          label="Показывать на сайте"
          defaultChecked={brand?.is_active ?? true}
        />

        <FormMessage state={state} />
        <SubmitButton />
      </form>

      {brand && (
        <form action={deleteBrand} className="border-t border-line pt-6">
          <input type="hidden" name="id" value={brand.id} />
          <p className="mb-3 text-sm text-ink-soft">
            Удаление бренда удалит все его категории и товары.
          </p>
          <DeleteButton
            label="Удалить бренд"
            confirmText={`Удалить бренд «${brand.name}» вместе с категориями и товарами?`}
          />
        </form>
      )}
    </div>
  );
}
