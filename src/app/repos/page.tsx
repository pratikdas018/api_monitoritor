import { redirect } from "next/navigation";

import { RepoListClient } from "@/components/repos/RepoListClient";
import { getSessionUserId } from "@/lib/serverSession";

export default async function ReposPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login?next=/repos");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1300px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <RepoListClient />
    </main>
  );
}
