import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSessionFromCookies } from "@/lib/adminAuth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    redirect("/admin/login?next=/admin");
  }

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
