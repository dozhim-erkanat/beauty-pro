import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/status-select";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

export default async function AdminOrderPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const [{ data }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (!data) notFound();
  const order = data as Order;
  const lines = (items as OrderItem[] | null) ?? [];

  return (
    <div>
      <AdminHeader
        title={`Заказ №${order.number}`}
        description={formatDate(order.created_at)}
      />

      <Link
        href="/admin/orders"
        className="mt-4 inline-block text-sm text-ink-soft transition hover:text-accent"
      >
        ← Ко всем заказам
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="overflow-hidden rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-alt text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Товар</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">Кол-во</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3 text-ink">{line.product_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                    {formatPrice(line.price)}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{line.quantity}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-ink">
                    {line.price === null
                      ? "По запросу"
                      : formatPrice(line.price * line.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-line bg-surface-alt">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-medium text-ink">
                  Итого
                </td>
                <td className="px-4 py-3 font-semibold text-ink">
                  {formatPrice(order.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <aside className="rounded-card border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink">Клиент</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-ink-faint">Имя</dt>
              <dd className="text-ink">{order.customer_name}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">Телефон</dt>
              <dd>
                <a
                  href={`tel:${order.phone.replace(/[^+\d]/g, "")}`}
                  className="text-ink transition hover:text-accent"
                >
                  {order.phone}
                </a>
              </dd>
            </div>
            {order.email && (
              <div>
                <dt className="text-ink-faint">Email</dt>
                <dd>
                  <a
                    href={`mailto:${order.email}`}
                    className="text-ink transition hover:text-accent"
                  >
                    {order.email}
                  </a>
                </dd>
              </div>
            )}
            {order.comment && (
              <div>
                <dt className="text-ink-faint">Комментарий</dt>
                <dd className="text-ink">{order.comment}</dd>
              </div>
            )}
          </dl>

          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2 text-sm text-ink-faint">Статус заказа</div>
            <StatusSelect
              action={updateOrderStatus}
              id={order.id}
              status={order.status}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
