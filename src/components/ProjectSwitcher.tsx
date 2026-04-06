import Link from "next/link";

import type { ProjectView } from "@/lib/queries";

type ProjectSwitcherProps = {
  projects: ProjectView[];
  activeProjectId: string | null;
};

export function ProjectSwitcher({ projects, activeProjectId }: ProjectSwitcherProps) {
  if (projects.length === 0) return null;

  return (
    <div className="flex max-w-full flex-wrap items-center gap-2">
      {projects.map((project) => {
        const isActive = activeProjectId === project.id || (!activeProjectId && projects[0]?.id === project.id);
        return (
          <Link
            key={project.id}
            href={isActive ? "/dashboard" : `/dashboard?projectId=${project.id}`}
            title={project.name}
            className={`max-w-full truncate rounded-btn px-3 py-1.5 text-xs font-semibold tracking-wide transition sm:max-w-[16rem] ${
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
