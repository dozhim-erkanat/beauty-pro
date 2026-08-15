import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Телефон, почта и адрес — свяжитесь с нами для консультации.",
};

export default async function ContactsPage() {
  const settings = await getSettings();

  const rows = [
    settings.phone && {
      label: "Телефон",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/[^+\d]/g, "")}`,
    },
    settings.whatsapp && {
      label: "WhatsApp",
      value: "Написать в WhatsApp",
      href: `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`,
    },
    settings.email && {
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings.instagram && {
      label: "Instagram",
      value: "Профиль в Instagram",
      href: settings.instagram,
    },
    settings.address && { label: "Адрес", value: settings.address, href: null },
  ].filter(Boolean) as { label: string; value: string; href: string | null }[];

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Контакты</h1>
      {settings.about && (
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">{settings.about}</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <dl className="divide-y divide-line rounded-card border border-line">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-wrap justify-between gap-2 p-4"
            >
              <dt className="text-sm text-ink-soft">{row.label}</dt>
              <dd className="font-medium text-ink">
                {row.href ? (
                  <a
                    href={row.href}
                    target={row.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="transition hover:text-accent"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="rounded-card border border-line bg-surface-alt p-6">
          <h2 className="text-lg font-semibold text-ink">Нужна консультация?</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Оставьте номер — подберём оборудование под задачи вашего салона.
          </p>
          <div className="mt-4">
            <LeadForm />
          </div>
        </div>
      </div>
    </div>
  );
}
