import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export interface Project {
  id: string;
  name: string;
  slug: string;
  isOwned: boolean;
}

export type ProjectDialogMode = "create" | "rename" | "delete" | null;

export interface UseProjectDialogsOptions {
  initialProjects?: Project[];
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useProjectDialogs({ initialProjects = [] }: UseProjectDialogsOptions = {}) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dialogMode, setDialogMode] = useState<ProjectDialogMode>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) {
      return null;
    }

    return projects.find((project) => project.id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);

  const slugPreview = useMemo(() => slugify(formName), [formName]);

  const resetDialogState = () => {
    setSelectedProjectId(null);
    setFormName("");
    setIsSubmitting(false);
  };

  const clearPendingTimer = () => {
    if (pendingTimerRef.current !== null) {
      window.clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
  };

  const closeDialog = () => {
    clearPendingTimer();
    setDialogMode(null);
    resetDialogState();
  };

  const openCreateDialog = () => {
    clearPendingTimer();
    setDialogMode("create");
    resetDialogState();
  };

  const openRenameDialog = (project: Project) => {
    clearPendingTimer();
    setDialogMode("rename");
    setSelectedProjectId(project.id);
    setFormName(project.name);
    setIsSubmitting(false);
  };

  const openDeleteDialog = (project: Project) => {
    clearPendingTimer();
    setDialogMode("delete");
    setSelectedProjectId(project.id);
    setFormName("");
    setIsSubmitting(false);
  };

  const submitCreate = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const nextName = formName.trim();
    const nextSlug = slugify(nextName);

    if (!nextName || !nextSlug) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nextName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const project = (await response.json()) as { id: string; name: string };

      setProjects((currentProjects) => [
        {
          id: project.id,
          name: project.name,
          slug: slugify(project.name),
          isOwned: true,
        },
        ...currentProjects,
      ]);

      closeDialog();
      router.push(`/editor/${project.id}`);
      router.refresh();
    } catch {
      setIsSubmitting(false);
    }
  };

  const submitRename = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!selectedProject) {
      return;
    }

    const nextName = formName.trim();

    if (!nextName) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nextName }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename project");
      }

      const updatedProject = (await response.json()) as { id: string; name: string };

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === selectedProject.id
            ? {
                ...project,
                name: updatedProject.name,
                slug: slugify(updatedProject.name),
              }
            : project,
        ),
      );

      closeDialog();
      router.refresh();
    } catch {
      setIsSubmitting(false);
    }
  };

  const submitDelete = async () => {
    if (!selectedProject) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== selectedProject.id));
      closeDialog();

      if (window.location.pathname === `/editor/${selectedProject.id}`) {
        router.push("/editor");
      }

      router.refresh();
    } catch {
      setIsSubmitting(false);
    }
  };

  return {
    projects,
    dialogMode,
    selectedProject,
    formName,
    setFormName,
    slugPreview,
    isSubmitting,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    submitCreate,
    submitRename,
    submitDelete,
  };
}
