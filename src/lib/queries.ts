import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Brand, Category, ProductWithRefs } from "@/lib/types";

const PRODUCT_SELECT =
  "*, brand:brands(id,slug,name), category:categories(id,slug,name)";

export const PAGE_SIZE = 24;

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data;
}

export async function getCategories(brandId?: string): Promise<Category[]> {
  const supabase = await createClient();
  let query = supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  if (brandId) query = query.eq("brand_id", brandId);
  const { data } = await query;
  return data ?? [];
}

export async function getFeaturedProducts(limit = 8): Promise<ProductWithRefs[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order")
    .limit(limit);
  return (data as ProductWithRefs[] | null) ?? [];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithRefs | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data as ProductWithRefs | null;
}

export async function getRelatedProducts(
  product: ProductWithRefs,
  limit = 4,
): Promise<ProductWithRefs[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(limit);

  query = product.category_id
    ? query.eq("category_id", product.category_id)
    : query.eq("brand_id", product.brand_id);

  const { data } = await query;
  return (data as ProductWithRefs[] | null) ?? [];
}

export type CatalogFilters = {
  q?: string;
  brand?: string; // slug
  category?: string; // slug
  minPrice?: number;
  maxPrice?: number;
  sort?: "new" | "price_asc" | "price_desc" | "name";
  page?: number;
};

export type CatalogResult = {
  products: ProductWithRefs[];
  total: number;
  page: number;
  pageCount: number;
};

export async function getCatalog(
  filters: CatalogFilters,
): Promise<CatalogResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);

  // Slug'и фильтров переводим в id отдельными запросами — так проще, чем
  // фильтровать по вложенным полям join'а.
  let brandId: string | undefined;
  if (filters.brand) {
    const { data } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", filters.brand)
      .maybeSingle();
    // Несуществующий бренд не должен показывать весь каталог.
    if (!data) return { products: [], total: 0, page, pageCount: 0 };
    brandId = data.id;
  }

  let categoryId: string | undefined;
  if (filters.category) {
    let q = supabase.from("categories").select("id").eq("slug", filters.category);
    if (brandId) q = q.eq("brand_id", brandId);
    const { data } = await q.maybeSingle();
    if (!data) return { products: [], total: 0, page, pageCount: 0 };
    categoryId = data.id;
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (brandId) query = query.eq("brand_id", brandId);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, "\\$&")}%`;
    query = query.or(
      `name.ilike.${term},short_description.ilike.${term},sku.ilike.${term}`,
    );
  }
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "name":
      query = query.order("name");
      break;
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("sort_order").order("created_at", { ascending: false });
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query.range(from, from + PAGE_SIZE - 1);

  const total = count ?? 0;
  return {
    products: (data as ProductWithRefs[] | null) ?? [],
    total,
    page,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key,value");
  const result: Record<string, string> = {};
  for (const row of data ?? []) {
    if (row.value) result[row.key] = row.value;
  }
  return result;
}
