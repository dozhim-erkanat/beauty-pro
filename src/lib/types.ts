export type Brand = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Category = {
  id: string;
  brand_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Spec = { name: string; value: string };

export type Product = {
  id: string;
  brand_id: string;
  category_id: string | null;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  specs: Spec[];
  sku: string | null;
  price: number | null;
  old_price: number | null;
  images: string[];
  in_stock: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Товар вместе с названиями бренда и категории (join в запросах каталога). */
export type ProductWithRefs = Product & {
  brand: Pick<Brand, "id" | "slug" | "name"> | null;
  category: Pick<Category, "id" | "slug" | "name"> | null;
};

export type OrderStatus = "new" | "in_progress" | "done" | "canceled";

export type Order = {
  id: string;
  number: number;
  customer_name: string;
  phone: string;
  email: string | null;
  comment: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number | null;
  quantity: number;
};

export type Lead = {
  id: string;
  product_id: string | null;
  product_name: string | null;
  name: string;
  phone: string;
  comment: string | null;
  status: OrderStatus;
  created_at: string;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новый",
  in_progress: "В работе",
  done: "Завершён",
  canceled: "Отменён",
};
