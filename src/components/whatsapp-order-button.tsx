import { formatPrice } from "@/lib/format";

type Props = {
  /** Номер получателя в международном формате, лишние символы убираются. */
  phone: string;
  productName: string;
  productSlug: string;
  price: number | null;
  sku?: string | null;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://beautypro.com.kz";

/**
 * Открывает WhatsApp с заранее подставленным текстом заказа.
 * Обычная ссылка wa.me — работает и в мобильном приложении, и в веб-версии.
 */
export function WhatsAppOrderButton({
  phone,
  productName,
  productSlug,
  price,
  sku,
}: Props) {
  const number = phone.replace(/\D/g, "");
  if (!number) return null;

  const text = [
    "Здравствуйте! Хочу заказать товар с сайта:",
    "",
    productName,
    ...(sku ? [`Артикул: ${sku}`] : []),
    `Цена: ${formatPrice(price)}`,
    `${SITE_URL}/product/${productSlug}`,
  ].join("\n");

  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 font-medium text-white transition hover:bg-[#1da851]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.26-1.38a9.86 9.86 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24a8.18 8.18 0 0 1 5.82 2.42 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24Z" />
      </svg>
      Заказать через WhatsApp
    </a>
  );
}
