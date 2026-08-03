"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type Project } from "@/components/editor/use-project-dialogs";

interface ProjectDialogsProps {
  dialogMode: "create" | "rename" | "delete" | null;
  selectedProject: Project | null;
  formName: string;
  setFormName: (value: string) => void;
  slugPreview: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmitCreate: (event?: FormEvent<HTMLFormElement>) => void;
  onSubmitRename: (event?: FormEvent<HTMLFormElement>) => void;
  onSubmitDelete: () => void;
}

export function ProjectDialogs({
  dialogMode,
  selectedProject,
  formName,
  setFormName,
  slugPreview,
  isSubmitting,
  onClose,
  onSubmitCreate,
  onSubmitRename,
  onSubmitDelete,
}: ProjectDialogsProps) {
  const isOpen = dialogMode !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open && !isSubmitting ? onClose() : undefined)}>
      {dialogMode === "create" ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>Start a fresh architecture workspace.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmitCreate}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-copy-primary" htmlFor="project-name">
                Project name
              </label>
              <Input
                id="project-name"
                autoFocus
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                placeholder="e.g. Landing page refresh"
              />
            </div>

            <div className="rounded-2xl border border-surface-border bg-subtle p-3 text-sm text-copy-secondary">
              <p className="font-medium text-copy-primary">Preview slug</p>
              <p className="mt-1">/{slugPreview || "project-slug"}</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formName.trim() || !slugPreview}>
                {isSubmitting ? "Creating..." : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      ) : null}

      {dialogMode === "rename" && selectedProject ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Rename {selectedProject.name}. The new name will update instantly.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={onSubmitRename}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-copy-primary" htmlFor="rename-project-name">
                Project name
              </label>
              <Input
                id="rename-project-name"
                autoFocus
                value={formName}
                onChange={(event) => setFormName(event.target.value)}
                placeholder="Project name"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formName.trim()}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      ) : null}

      {dialogMode === "delete" && selectedProject ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Delete {selectedProject.name} from your workspace?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" variant="default" className="bg-red-600 hover:bg-red-700" onClick={onSubmitDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
