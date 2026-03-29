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
            className={`rounded-btn px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
              isActive
                ? "glass-card border-l-2 border-l-accent accent-text"
                : "border border-border-accent bg-accent/10 text-text-secondary hover:text-text-primary"
            }`}
          >
            {project.name}
          </Link>
        );
      })}
    </div>
  );
}
