"use server";

import { createClient } from "@/lib/supabase/server";

export type FormState = { ok: boolean; message: string } | null;

const PHONE_RE = /^[+\d][\d\s()\-]{5,20}$/;

function readContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  return { name, phone, comment };
}

/** Заявка «Узнать о товаре» с карточки товара. */
export async function createLead(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const { name, phone, comment } = readContact(formData);
  const productId = String(formData.get("product_id") ?? "").trim() || null;
  const productName = String(formData.get("product_name") ?? "").trim() || null;

  if (name.length < 2) return { ok: false, message: "Укажите имя." };
  if (!PHONE_RE.test(phone))
    return { ok: false, message: "Укажите корректный номер телефона." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    product_id: productId,
    product_name: productName,
    name,
    phone,
    comment: comment || null,
  });

  if (error) {
    return { ok: false, message: "Не удалось отправить заявку. Попробуйте ещё раз." };
  }
  return { ok: true, message: "Заявка отправлена — мы свяжемся с вами." };
}

export type CheckoutItem = {
  id: string;
  name: string;
  price: number | null;
  quantity: number;
};

export type CheckoutResult =
  | { ok: true; orderNumber: number }
  | { ok: false; message: string };

/** Оформление заказа из корзины. */
export async function createOrder(
  customer: { name: string; phone: string; email: string; comment: string },
  items: CheckoutItem[],
): Promise<CheckoutResult> {
  const name = customer.name.trim();
  const phone = customer.phone.trim();

  if (name.length < 2) return { ok: false, message: "Укажите имя." };
  if (!PHONE_RE.test(phone))
    return { ok: false, message: "Укажите корректный номер телефона." };
  if (!items.length) return { ok: false, message: "Корзина пуста." };

  const supabase = await createClient();

  // Цены и состав заказа считает SQL-функция по данным из products —
  // корзина в браузере не является источником правды.
  const { data, error } = await supabase.rpc("create_order", {
    p_name: name,
    p_phone: phone,
    p_email: customer.email.trim(),
    p_comment: customer.comment.trim(),
    p_items: items.map((i) => ({
      id: i.id,
      quantity: Math.min(999, Math.max(1, Math.round(i.quantity))),
    })),
  });

  if (error || typeof data !== "number") {
    return {
      ok: false,
      message: error?.message.includes("empty_order")
        ? "Товары из корзины больше недоступны."
        : "Не удалось оформить заказ. Попробуйте позже.",
    };
  }

  return { ok: true, orderNumber: data };
}
