"use client";

import { useActionState } from "react";
import {
  deleteCategory,
  saveCategory,
  type ActionState,
} from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  Checkbox,
  DeleteButton,
  FormMessage,
  Labeled,
  SubmitButton,
} from "@/components/admin/ui";
import type { Brand, Category } from "@/lib/types";

export function CategoryForm({
  category,
  brands,
  defaultBrandId,
}: {
  category?: Category;
  brands: Brand[];
  defaultBrandId?: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveCategory,
    null,
  );

  return (
    <div className="mt-6 max-w-2xl space-y-6">
      <form action={formAction} className="space-y-5">
        {category && <input type="hidden" name="id" value={category.id} />}

        <Labeled label="Бренд">
          <select
            name="brand_id"
            required
            defaultValue={category?.brand_id ?? defaultBrandId ?? ""}
            className="field"
          >
            <option value="" disabled>
              Выберите бренд
            </option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </Labeled>

        <Labeled label="Название">
          <input
            name="name"
            required
            defaultValue={category?.name}
            className="field"
            placeholder="Например: Лазерная эпиляция"
          />
        </Labeled>

        <Labeled
          label="Адрес (slug)"
          hint="Оставьте пустым — сгенерируем из названия."
        >
          <input name="slug" defaultValue={category?.slug} className="field" />
        </Labeled>

        <Labeled label="Описание">
          <textarea
            name="description"
            rows={3}
            defaultValue={category?.description ?? ""}
            className="field resize-y"
          />
        </Labeled>

        <Labeled label="Картинка категории">
          <ImageUploader
            name="image_url"
            folder="categories"
            defaultValue={category?.image_url ? [category.image_url] : []}
          />
        </Labeled>

        <Labeled label="Порядок сортировки">
          <input
            name="sort_order"
            type="number"
            defaultValue={category?.sort_order ?? 0}
            className="field w-32"
          />
        </Labeled>

        <Checkbox
          name="is_active"
          label="Показывать на сайте"
          defaultChecked={category?.is_active ?? true}
        />

        <FormMessage state={state} />
        <SubmitButton />
      </form>

      {category && (
        <form action={deleteCategory} className="border-t border-line pt-6">
          <input type="hidden" name="id" value={category.id} />
          <p className="mb-3 text-sm text-ink-soft">
            Товары категории останутся в каталоге, но потеряют привязку к ней.
          </p>
          <DeleteButton
            label="Удалить категорию"
            confirmText={`Удалить категорию «${category.name}»?`}
          />
        </form>
      )}
    </div>
  );
}
