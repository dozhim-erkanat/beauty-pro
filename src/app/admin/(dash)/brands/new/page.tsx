import { BrandForm } from "@/components/admin/brand-form";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export default async function NewBrandPage() {
  await requireAdmin();
  return (
    <div>
      <AdminHeader title="Новый бренд" />
      <BrandForm />
    </div>
  );
}
