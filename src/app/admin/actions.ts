"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";
import type { Spec } from "@/lib/types";

export type ActionState = { ok: boolean; message: string } | null;

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function nullable(formData: FormData, key: string): string | null {
  return str(formData, key) || null;
}

function intOrNull(formData: FormData, key: string): number | null {
  const raw = str(formData, key).replace(/\s/g, "");
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

/** «Мощность\n60 Вт» приходит парами полей spec_name[]/spec_value[]. */
function readSpecs(formData: FormData): Spec[] {
  const names = formData.getAll("spec_name").map(String);
  const values = formData.getAll("spec_value").map(String);
  return names
    .map((name, i) => ({ name: name.trim(), value: (values[i] ?? "").trim() }))
    .filter((s) => s.name && s.value);
}

function revalidateCatalog() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------
// Бренды
// ---------------------------------------------------------------------

export async function saveBrand(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return { ok: false, message: "Укажите название бренда." };

  const payload = {
    name,
    slug: str(formData, "slug") || slugify(name),
    description: nullable(formData, "description"),
    logo_url: nullable(formData, "logo_url"),
    sort_order: intOrNull(formData, "sort_order") ?? 0,
    is_active: bool(formData, "is_active"),
  };

  const { error } = id
    ? await supabase.from("brands").update(payload).eq("id", id)
    : await supabase.from("brands").insert(payload);

  if (error) {
    return {
      ok: false,
      message: error.code === "23505"
        ? "Бренд с таким адресом (slug) уже существует."
        : `Ошибка сохранения: ${error.message}`,
    };
  }

  revalidateCatalog();
  redirect("/admin/brands");
}

export async function deleteBrand(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (id) await supabase.from("brands").delete().eq("id", id);
  revalidateCatalog();
  redirect("/admin/brands");
}

// ---------------------------------------------------------------------
// Категории
// ---------------------------------------------------------------------

export async function saveCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const id = str(formData, "id");
  const name = str(formData, "name");
  const brandId = str(formData, "brand_id");
  if (!name) return { ok: false, message: "Укажите название категории." };
  if (!brandId) return { ok: false, message: "Выберите бренд." };

  const payload = {
    brand_id: brandId,
    name,
    slug: str(formData, "slug") || slugify(name),
    description: nullable(formData, "description"),
    image_url: nullable(formData, "image_url"),
    sort_order: intOrNull(formData, "sort_order") ?? 0,
    is_active: bool(formData, "is_active"),
  };

  const { error } = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);

  if (error) {
    return {
      ok: false,
      message: error.code === "23505"
        ? "У этого бренда уже есть категория с таким адресом (slug)."
        : `Ошибка сохранения: ${error.message}`,
    };
  }

  revalidateCatalog();
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (id) await supabase.from("categories").delete().eq("id", id);
  revalidateCatalog();
  redirect("/admin/categories");
}

// ---------------------------------------------------------------------
// Товары
// ---------------------------------------------------------------------

export async function saveProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const id = str(formData, "id");
  const name = str(formData, "name");
  const brandId = str(formData, "brand_id");
  if (!name) return { ok: false, message: "Укажите название товара." };
  if (!brandId) return { ok: false, message: "Выберите бренд." };

  const price = intOrNull(formData, "price");
  const oldPrice = intOrNull(formData, "old_price");
  if (price !== null && price < 0)
    return { ok: false, message: "Цена не может быть отрицательной." };

  const payload = {
    brand_id: brandId,
    category_id: nullable(formData, "category_id"),
    name,
    slug: str(formData, "slug") || slugify(name),
    short_description: nullable(formData, "short_description"),
    description: nullable(formData, "description"),
    specs: readSpecs(formData),
    sku: nullable(formData, "sku"),
    price,
    old_price: oldPrice,
    images: str(formData, "images")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    in_stock: bool(formData, "in_stock"),
    is_featured: bool(formData, "is_featured"),
    is_active: bool(formData, "is_active"),
    sort_order: intOrNull(formData, "sort_order") ?? 0,
  };

  const { error } = id
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);

  if (error) {
    return {
      ok: false,
      message: error.code === "23505"
        ? "Товар с таким адресом (slug) уже существует."
        : `Ошибка сохранения: ${error.message}`,
    };
  }

  revalidateCatalog();
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (id) await supabase.from("products").delete().eq("id", id);
  revalidateCatalog();
  redirect("/admin/products");
}

/** Быстрое переключение «показывать / скрыть» прямо из списка товаров. */
export async function toggleProductActive(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const next = str(formData, "next") === "true";
  if (id) await supabase.from("products").update({ is_active: next }).eq("id", id);
  revalidateCatalog();
  revalidatePath("/admin/products");
}

// ---------------------------------------------------------------------
// Заказы и заявки
// ---------------------------------------------------------------------

export async function updateOrderStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (id && status) await supabase.from("orders").update({ status }).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateLeadStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (id && status) await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function deleteLead(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");
  if (id) await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
}

// ---------------------------------------------------------------------
// Настройки сайта
// ---------------------------------------------------------------------

const SETTING_KEYS = [
  "phone",
  "whatsapp",
  "email",
  "address",
  "instagram",
  "about",
] as const;

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase } = await requireAdmin();

  const rows = SETTING_KEYS.map((key) => ({ key, value: str(formData, key) }));
  const { error } = await supabase.from("settings").upsert(rows);

  if (error) return { ok: false, message: `Ошибка сохранения: ${error.message}` };

  revalidateCatalog();
  return { ok: true, message: "Настройки сохранены." };
}

// ---------------------------------------------------------------------
// Выход
// ---------------------------------------------------------------------

export async function signOut() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
