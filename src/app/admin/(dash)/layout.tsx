import { signOut } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <AdminNav email={user.email ?? ""} signOutAction={signOut} />
      <div className="flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
