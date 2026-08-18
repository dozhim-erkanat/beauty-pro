import "server-only";
import { formatPrice } from "@/lib/format";

/**
 * Отправка уведомлений в WhatsApp через Green API.
 *
 * Работает на исходящих запросах sendMessage — вебхук инстанса (входящие
 * сообщения) не затрагивается, поэтому один номер может одновременно
 * обслуживать несколько сайтов и писать в разные группы.
 */

const BASE = process.env.GREEN_API_BASE_URL || "https://api.green-api.com";
const ID = process.env.GREEN_API_ID_INSTANCE;
const TOKEN = process.env.GREEN_API_TOKEN;
const CHAT_ID = process.env.GREEN_API_CHAT_ID;

/** Настроена ли интеграция. Без неё сайт работает как раньше, просто без уведомлений. */
export function isGreenApiConfigured(): boolean {
  return Boolean(ID && TOKEN && CHAT_ID);
}

type SendResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Отправляет текст в чат по умолчанию (GREEN_API_CHAT_ID) или в указанный.
 * Никогда не бросает исключение: уведомление не должно ломать оформление заказа.
 */
export async function sendWhatsApp(text: string, chatId = CHAT_ID): Promise<SendResult> {
  if (!ID || !TOKEN || !chatId) {
    return { ok: false, error: "Green API не настроен" };
  }

  try {
    const res = await fetch(`${BASE}/waInstance${ID}/sendMessage/${TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message: text }),
      signal: AbortSignal.timeout(10_000),
    });

    const body = (await res.json().catch(() => null)) as { idMessage?: string } | null;
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${JSON.stringify(body)?.slice(0, 200)}` };
    }
    return { ok: true, id: body?.idMessage ?? "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

const SITE = process.env.NEXT_PUBLIC_SITE_NAME || "Beauty Pro";

function contactLines(name: string, phone: string, comment?: string | null): string[] {
  const lines = [`👤 ${name}`, `📞 ${phone}`];
  if (comment) lines.push(`💬 ${comment}`);
  return lines;
}

/** Уведомление о заявке с карточки товара или со страницы контактов. */
export function leadMessage(input: {
  name: string;
  phone: string;
  comment?: string | null;
  productName?: string | null;
}): string {
  return [
    `🔔 *${SITE} — новая заявка*`,
    "",
    ...(input.productName ? [`🛍 ${input.productName}`] : []),
    ...contactLines(input.name, input.phone, input.comment),
  ].join("\n");
}

/** Уведомление о заказе из корзины. */
export function orderMessage(input: {
  orderNumber: number;
  name: string;
  phone: string;
  email?: string | null;
  comment?: string | null;
  items: { name: string; price: number | null; quantity: number }[];
}): string {
  const positions = input.items.map(
    (i) => `• ${i.name} — ${i.quantity} шт. × ${formatPrice(i.price)}`,
  );
  const total = input.items.reduce(
    (sum, i) => sum + (i.price ?? 0) * i.quantity,
    0,
  );
  const hasRequestPrice = input.items.some((i) => i.price === null);

  return [
    `🛒 *${SITE} — заказ №${input.orderNumber}*`,
    "",
    ...contactLines(input.name, input.phone, input.comment),
    ...(input.email ? [`✉️ ${input.email}`] : []),
    "",
    ...positions,
    "",
    `Итого: ${formatPrice(total)}${hasRequestPrice ? " + позиции по запросу" : ""}`,
  ].join("\n");
}
