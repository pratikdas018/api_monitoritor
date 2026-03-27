import { redirect } from "next/navigation";

import { connectToDatabase, hasMongoConfig } from "@/lib/db";
import { getSessionUserId } from "@/lib/serverSession";
import AnalysisResult from "@/models/AnalysisResult";

export const dynamic = "force-dynamic";

function truncateLine(text: string, max = 220) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
}

export default async function AnalysisPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login?next=/analysis");
  }

  if (!hasMongoConfig()) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          MongoDB is not configured. Analysis records are unavailable.
        </p>
      </main>
    );
  }

  await connectToDatabase();
  const analyses = await AnalysisResult.find({ userId }).sort({ createdAt: -1 }).limit(40).lean();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1200px] space-y-5 px-4 py-6 sm:px-6 md:px-8 lg:px-10">
      <header className="glass-panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">AI Debug Reports</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-100 sm:text-3xl">
          API Failure Analysis
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Root-cause suggestions generated from failure logs + scanned repository code context.
        </p>
      </header>

      <section className="space-y-3">
        {analyses.length === 0 ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-500">
            No analysis records yet. Go to a repository page and run AI failure analysis.
          </p>
        ) : (
          analyses.map((item) => (
            <article key={String(item._id)} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{item.endpoint}</p>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="mt-3 text-sm text-rose-200">❌ API Down</p>
              <p className="mt-2 text-sm text-slate-200">
                <span className="font-semibold text-slate-100">Reason: </span>
                {item.result.reason}
              </p>

              <div className="mt-2">
                <p className="text-sm font-semibold text-slate-100">Possible Causes:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {item.result.possibleCauses.map((cause, index) => (
                    <li key={`${String(item._id)}-cause-${index}`} className="break-words">
                      {truncateLine(cause)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-2">
                <p className="text-sm font-semibold text-slate-100">Suggested Fixes:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {item.result.suggestedFixes.map((fix, index) => (
                    <li key={`${String(item._id)}-fix-${index}`} className="break-words">
                      {truncateLine(fix)}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-2 text-sm text-slate-200">
                <span className="font-semibold text-slate-100">Possible File: </span>
                {item.result.possibleFile ?? "Unknown"}
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
