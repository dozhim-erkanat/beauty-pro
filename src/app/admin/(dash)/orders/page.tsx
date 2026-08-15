import Link from "next/link";
import { updateOrderStatus } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/status-select";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

export default async function AdminOrdersPage() {
  const { supabase } = await requireAdmin();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <AdminHeader title="Заказы" description="Заказы из корзины на сайте." />

      {!orders?.length ? (
        <p className="mt-8 text-ink-soft">Заказов пока нет.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-alt text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">№</th>
                <th className="px-4 py-3 font-medium">Клиент</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Дата</th>
                <th className="px-4 py-3 font-medium">Сумма</th>
                <th className="px-4 py-3 font-medium">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(orders as Order[]).map((order) => (
                <tr key={order.id} className="transition hover:bg-surface-alt">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-ink transition hover:text-accent"
                    >
                      №{order.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink">{order.customer_name}</div>
                    <a
                      href={`tel:${order.phone.replace(/[^+\d]/g, "")}`}
                      className="text-xs text-ink-faint transition hover:text-accent"
                    >
                      {order.phone}
                    </a>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-soft md:table-cell">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-ink">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusSelect
                      action={updateOrderStatus}
                      id={order.id}
                      status={order.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
