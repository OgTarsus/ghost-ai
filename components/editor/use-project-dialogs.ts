import { useMemo, useRef, useState, type FormEvent } from "react";

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
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dialogMode, setDialogMode] = useState<ProjectDialogMode>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingTimerRef = useRef<number | null>(null);

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

  const submitCreate = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const nextName = formName.trim();
    const nextSlug = slugify(nextName);

    if (!nextName || !nextSlug) {
      return;
    }

    setIsSubmitting(true);

    clearPendingTimer();
    pendingTimerRef.current = window.setTimeout(() => {
      pendingTimerRef.current = null;

      if (!dialogMode) {
        return;
      }

      setProjects((currentProjects) => [
        ...currentProjects,
        {
          id: `${Date.now()}`,
          name: nextName,
          slug: nextSlug,
          isOwned: true,
        },
      ]);
      closeDialog();
    }, 120);
  };

  const submitRename = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!selectedProject) {
      return;
    }

    const nextName = formName.trim();

    if (!nextName) {
      return;
    }

    setIsSubmitting(true);

    clearPendingTimer();
    pendingTimerRef.current = window.setTimeout(() => {
      pendingTimerRef.current = null;

      if (!dialogMode) {
        return;
      }

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === selectedProject.id
            ? {
                ...project,
                name: nextName,
                slug: slugify(nextName),
              }
            : project,
        ),
      );
      closeDialog();
    }, 120);
  };

  const submitDelete = () => {
    if (!selectedProject) {
      return;
    }

    setIsSubmitting(true);

    clearPendingTimer();
    pendingTimerRef.current = window.setTimeout(() => {
      pendingTimerRef.current = null;

      if (!dialogMode) {
        return;
      }

      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== selectedProject.id));
      closeDialog();
    }, 120);
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
