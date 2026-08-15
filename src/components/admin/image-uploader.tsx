"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** Имя скрытого поля: значения уходят в форму строками через перевод строки. */
  name: string;
  defaultValue?: string[];
  /** Одна картинка (логотип бренда) или галерея (товар). */
  multiple?: boolean;
  folder: string;
};

/**
 * Загружает файлы в бакет `media` Supabase Storage и хранит публичные ссылки
 * в скрытом textarea — так форма остаётся обычной HTML-формой и работает
 * с Server Action без дополнительного API.
 */
export function ImageUploader({
  name,
  defaultValue = [],
  multiple = false,
  folder,
}: Props) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);

    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 8 * 1024 * 1024) {
        setError(`Файл «${file.name}» больше 8 МБ.`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "31536000", upsert: false });

      if (uploadError) {
        setError(`Не удалось загрузить «${file.name}»: ${uploadError.message}`);
        continue;
      }

      const { data } = supabase.storage.from("media").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    setUrls((prev) => (multiple ? [...prev, ...uploaded] : uploaded.slice(-1)));
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, delta: number) {
    setUrls((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={urls.join("\n")} />

      {urls.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {urls.map((url, i) => (
            <div
              key={url}
              className="relative h-24 w-24 overflow-hidden rounded-lg border border-line bg-surface-alt"
            >
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => setUrls((prev) => prev.filter((u) => u !== url))}
                aria-label="Удалить изображение"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-xs text-white transition hover:bg-accent"
              >
                ×
              </button>
              {multiple && urls.length > 1 && (
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/60 text-xs text-white">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    aria-label="Переместить левее"
                    className="px-2 py-0.5 hover:bg-ink"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    aria-label="Переместить правее"
                    className="px-2 py-0.5 hover:bg-ink"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      <label
        htmlFor={inputId}
        className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-line bg-surface px-4 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
      >
        {uploading
          ? "Загружаем…"
          : multiple
            ? "Добавить фото"
            : urls.length
              ? "Заменить фото"
              : "Загрузить фото"}
      </label>

      {multiple && urls.length > 1 && (
        <p className="mt-2 text-xs text-ink-faint">
          Первое фото используется как основное в каталоге.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-accent">{error}</p>}
    </div>
  );
}
