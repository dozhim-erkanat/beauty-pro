import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Админ-панель",
  robots: { index: false, follow: false },
};

/** Общая обёртка для админки: у неё нет шапки и подвала сайта. */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen flex-col bg-surface-alt">{children}</div>;
}
