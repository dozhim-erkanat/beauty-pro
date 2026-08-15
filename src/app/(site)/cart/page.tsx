import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Корзина",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">Корзина</h1>
      <CartView />
    </div>
  );
}
