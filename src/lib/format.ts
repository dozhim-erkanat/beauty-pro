const tenge = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

/** 4500000 → «4 500 000 ₸», null → «Цена по запросу» */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Цена по запросу";
  return `${tenge.format(value)} ₸`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** «Lumina ICE 800» → «lumina-ice-800» (с транслитерацией кириллицы). */
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  ә: "a", ғ: "g", қ: "q", ң: "ng", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Обрезает текст до n символов по границе слова. */
export function truncate(text: string, n: number): string {
  if (text.length <= n) return text;
  return `${text.slice(0, text.lastIndexOf(" ", n))}…`;
}
