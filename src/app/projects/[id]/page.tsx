"use client";

import { useParams } from "next/navigation";
import { ProjectLocked, ProjectSession } from "@/components/job/project-session";
import { getJobProject, isJobUnlocked } from "@/lib/job-projects";
import { useProgress } from "@/lib/progress-store";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const progress = useProgress();
  const project = getJobProject(params.id);

  if (!progress.hydrated) {
    return <p className="px-6 py-16 text-sm text-muted-foreground">Cargando encargo…</p>;
  }

  if (!project) {
    return <ProjectLocked title="Ese encargo no existe" />;
  }

  if (!isJobUnlocked(project, progress)) {
    return <ProjectLocked title={project.title} />;
  }

  const skipIntro = Boolean(progress.jobProjects?.[project.id]?.introSeen);
  return <ProjectSession project={project} skipIntro={skipIntro} />;
}
