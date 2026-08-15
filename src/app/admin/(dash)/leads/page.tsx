import { deleteLead, updateLeadStatus } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/status-select";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import type { Lead } from "@/lib/types";

export default async function AdminLeadsPage() {
  const { supabase } = await requireAdmin();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <AdminHeader
        title="Заявки"
        description="Заявки с карточек товаров и со страницы контактов."
      />

      {!leads?.length ? (
        <p className="mt-8 text-ink-soft">Заявок пока нет.</p>
      ) : (
        <div className="mt-6 grid gap-3">
          {(leads as Lead[]).map((lead) => (
            <div
              key={lead.id}
              className="rounded-card border border-line bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-ink">{lead.name}</div>
                  <a
                    href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}
                    className="text-sm text-ink-soft transition hover:text-accent"
                  >
                    {lead.phone}
                  </a>
                  <div className="mt-1 text-xs text-ink-faint">
                    {formatDate(lead.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusSelect
                    action={updateLeadStatus}
                    id={lead.id}
                    status={lead.status}
                  />
                  <form action={deleteLead}>
                    <input type="hidden" name="id" value={lead.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-line px-3 py-1.5 text-sm text-ink-faint transition hover:border-accent hover:text-accent"
                    >
                      Удалить
                    </button>
                  </form>
                </div>
              </div>

              {lead.product_name && (
                <div className="mt-3 text-sm text-ink-soft">
                  Товар: <span className="text-ink">{lead.product_name}</span>
                </div>
              )}
              {lead.comment && (
                <p className="mt-2 rounded-lg bg-surface-alt p-3 text-sm text-ink-soft">
                  {lead.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
