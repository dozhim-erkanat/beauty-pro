import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUS_LABELS, type Lead, type Order } from "@/lib/types";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [products, brands, categories, newOrders, newLeads, orders, leads] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("brands").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const stats = [
    { label: "Товаров", value: products.count ?? 0, href: "/admin/products" },
    { label: "Категорий", value: categories.count ?? 0, href: "/admin/categories" },
    { label: "Брендов", value: brands.count ?? 0, href: "/admin/brands" },
    { label: "Новых заказов", value: newOrders.count ?? 0, href: "/admin/orders" },
    { label: "Новых заявок", value: newLeads.count ?? 0, href: "/admin/leads" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Сводка</h1>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-card border border-line bg-surface p-5 transition hover:border-accent"
          >
            <div className="text-3xl font-semibold text-ink">{stat.value}</div>
            <div className="mt-1 text-sm text-ink-soft">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-line bg-surface">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold text-ink">Последние заказы</h2>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Все →
            </Link>
          </header>
          {(orders.data as Order[] | null)?.length ? (
            <div className="divide-y divide-line">
              {(orders.data as Order[]).map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3 transition hover:bg-surface-alt"
                >
                  <div>
                    <div className="font-medium text-ink">
                      №{order.number} · {order.customer_name}
                    </div>
                    <div className="text-xs text-ink-faint">
                      {formatDate(order.created_at)} · {ORDER_STATUS_LABELS[order.status]}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-ink">
                    {formatPrice(order.total)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-ink-soft">Заказов пока нет.</p>
          )}
        </section>

        <section className="rounded-card border border-line bg-surface">
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-semibold text-ink">Последние заявки</h2>
            <Link
              href="/admin/leads"
              className="text-sm font-medium text-accent hover:text-accent-hover"
            >
              Все →
            </Link>
          </header>
          {(leads.data as Lead[] | null)?.length ? (
            <div className="divide-y divide-line">
              {(leads.data as Lead[]).map((lead) => (
                <div key={lead.id} className="px-5 py-3">
                  <div className="font-medium text-ink">
                    {lead.name} · {lead.phone}
                  </div>
                  <div className="text-xs text-ink-faint">
                    {formatDate(lead.created_at)}
                    {lead.product_name ? ` · ${lead.product_name}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-8 text-sm text-ink-soft">Заявок пока нет.</p>
          )}
        </section>
      </div>
    </div>
  );
}
