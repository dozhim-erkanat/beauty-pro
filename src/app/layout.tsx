import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Beauty Pro";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — оборудование и косметика для салонов красоты`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Каталог профессионального оборудования и косметики для салонов красоты: аппараты, расходные материалы, средства ухода.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
