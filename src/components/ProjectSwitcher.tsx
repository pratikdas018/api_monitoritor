import Link from "next/link";

import type { ProjectView } from "@/lib/queries";

type ProjectSwitcherProps = {
  projects: ProjectView[];
  activeProjectId: string | null;
};

export function ProjectSwitcher({ projects, activeProjectId }: ProjectSwitcherProps) {
  if (projects.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {projects.map((project) => {
        const isActive = activeProjectId === project.id || (!activeProjectId && projects[0]?.id === project.id);
        return (
          <Link
            key={project.id}
            href={isActive ? "/dashboard" : `/dashboard?projectId=${project.id}`}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
              isActive
                ? "border border-sky-400/60 bg-sky-500/15 text-sky-200"
                : "border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-slate-100"
            }`}
          >
            {project.name}
          </Link>
        );
      })}
    </div>
  );
}
