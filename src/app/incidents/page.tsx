import Link from "next/link";
import { redirect } from "next/navigation";

import { IncidentTimeline } from "@/components/IncidentTimeline";
import { getIncidents } from "@/lib/queries";
import { getSessionUserId } from "@/lib/serverSession";

export default async function IncidentsPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login?next=/incidents");
  }

  const incidents = await getIncidents(200, userId);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-text-muted">Incident Response</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
            Incident Timeline
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="btn-ghost px-3 py-2 text-sm font-medium"
        >
          Back to Dashboard
        </Link>
      </header>

      <IncidentTimeline incidents={incidents} />
    </main>
  );
}
