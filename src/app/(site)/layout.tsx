import { Suspense } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getBrands, getSettings } from "@/lib/queries";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Шапка и подвал одинаковы на всех страницах сайта, поэтому данные берём здесь.
  const [brands, settings] = await Promise.all([getBrands(), getSettings()]);

  return (
    <>
      <Suspense fallback={<div className="h-16 border-b border-line" />}>
        <SiteHeader
          brands={brands}
          phone={settings.phone}
          logoUrl={settings.logo_url}
        />
      </Suspense>
      <main className="flex-1">{children}</main>
      <SiteFooter brands={brands} settings={settings} />
    </>
  );
}
