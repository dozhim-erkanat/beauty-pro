"use client";

import { useActionState, useState } from "react";
import {
  deleteProduct,
  saveProduct,
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
import type { Brand, Category, Product, Spec } from "@/lib/types";

export function ProductForm({
  product,
  brands,
  categories,
}: {
  product?: Product;
  brands: Brand[];
  categories: Category[];
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveProduct,
    null,
  );
  const [brandId, setBrandId] = useState(
    product?.brand_id ?? brands[0]?.id ?? "",
  );
  const [specs, setSpecs] = useState<Spec[]>(
    product?.specs.length ? product.specs : [{ name: "", value: "" }],
  );

  // Категории показываем только выбранного бренда — иначе легко ошибиться.
  const brandCategories = categories.filter((c) => c.brand_id === brandId);

  return (
    <div className="mt-6 max-w-3xl space-y-6">
      <form action={formAction} className="space-y-5">
        {product && <input type="hidden" name="id" value={product.id} />}

        <div className="grid gap-5 sm:grid-cols-2">
          <Labeled label="Бренд">
            <select
              name="brand_id"
              required
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
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

          <Labeled label="Категория">
            <select
              name="category_id"
              defaultValue={product?.category_id ?? ""}
              key={brandId}
              className="field"
            >
              <option value="">Без категории</option>
              {brandCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Labeled>
        </div>

        <Labeled label="Название">
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="field"
          />
        </Labeled>

        <div className="grid gap-5 sm:grid-cols-2">
          <Labeled
            label="Адрес (slug)"
            hint="Оставьте пустым — сгенерируем из названия."
          >
            <input name="slug" defaultValue={product?.slug} className="field" />
          </Labeled>
          <Labeled label="Артикул">
            <input
              name="sku"
              defaultValue={product?.sku ?? ""}
              className="field"
            />
          </Labeled>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Labeled label="Цена, ₸" hint="Пусто = «цена по запросу»">
            <input
              name="price"
              type="number"
              min={0}
              defaultValue={product?.price ?? ""}
              className="field"
            />
          </Labeled>
          <Labeled label="Старая цена, ₸" hint="Для показа скидки">
            <input
              name="old_price"
              type="number"
              min={0}
              defaultValue={product?.old_price ?? ""}
              className="field"
            />
          </Labeled>
          <Labeled label="Порядок сортировки">
            <input
              name="sort_order"
              type="number"
              defaultValue={product?.sort_order ?? 0}
              className="field"
            />
          </Labeled>
        </div>

        <Labeled
          label="Краткое описание"
          hint="Одна строка — показывается в карточке каталога."
        >
          <input
            name="short_description"
            defaultValue={product?.short_description ?? ""}
            className="field"
          />
        </Labeled>

        <Labeled label="Полное описание" hint="Пустая строка разделяет абзацы.">
          <textarea
            name="description"
            rows={6}
            defaultValue={product?.description ?? ""}
            className="field resize-y"
          />
        </Labeled>

        <Labeled label="Фотографии">
          <ImageUploader
            name="images"
            folder="products"
            multiple
            defaultValue={product?.images ?? []}
          />
        </Labeled>

        <div>
          <span className="text-sm font-medium text-ink">Характеристики</span>
          <div className="mt-2 space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2">
                <input
                  name="spec_name"
                  value={spec.name}
                  onChange={(e) =>
                    setSpecs((prev) =>
                      prev.map((s, j) =>
                        j === i ? { ...s, name: e.target.value } : s,
                      ),
                    )
                  }
                  placeholder="Мощность"
                  className="field"
                />
                <input
                  name="spec_value"
                  value={spec.value}
                  onChange={(e) =>
                    setSpecs((prev) =>
                      prev.map((s, j) =>
                        j === i ? { ...s, value: e.target.value } : s,
                      ),
                    )
                  }
                  placeholder="800 Вт"
                  className="field"
                />
                <button
                  type="button"
                  onClick={() =>
                    setSpecs((prev) => prev.filter((_, j) => j !== i))
                  }
                  aria-label="Удалить характеристику"
                  className="h-10 w-10 shrink-0 rounded-lg border border-line text-ink-faint transition hover:border-accent hover:text-accent"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSpecs((prev) => [...prev, { name: "", value: "" }])}
            className="mt-2 text-sm font-medium text-accent transition hover:text-accent-hover"
          >
            + Добавить характеристику
          </button>
        </div>

        <div className="flex flex-wrap gap-6 border-t border-line pt-5">
          <Checkbox
            name="is_active"
            label="Показывать на сайте"
            defaultChecked={product?.is_active ?? true}
          />
          <Checkbox
            name="in_stock"
            label="В наличии"
            defaultChecked={product?.in_stock ?? true}
          />
          <Checkbox
            name="is_featured"
            label="Показать на главной"
            defaultChecked={product?.is_featured ?? false}
          />
        </div>

        <FormMessage state={state} />
        <SubmitButton />
      </form>

      {product && (
        <form action={deleteProduct} className="border-t border-line pt-6">
          <input type="hidden" name="id" value={product.id} />
          <DeleteButton
            label="Удалить товар"
            confirmText={`Удалить товар «${product.name}»?`}
          />
        </form>
      )}
    </div>
  );
}
