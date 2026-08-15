import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import type { Brand, Category, Product } from "@/lib/types";

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data }, { data: brands }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("brands").select("*").order("name"),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!data) notFound();
  const product = data as Product;

  return (
    <div>
      <AdminHeader title={product.name} description="Редактирование товара" />
      <Link
        href={`/product/${product.slug}`}
        target="_blank"
        className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
      >
        Посмотреть на сайте ↗
      </Link>
      <ProductForm
        product={product}
        brands={(brands as Brand[] | null) ?? []}
        categories={(categories as Category[] | null) ?? []}
      />
    </div>
  );
}
