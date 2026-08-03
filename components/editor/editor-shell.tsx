"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/components/editor/use-project-dialogs";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
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
  } = useProjectDialogs();

  return (
    <div className="relative min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        rightSlot={<UserButton />}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={projects}
        onCreate={openCreateDialog}
        onRename={openRenameDialog}
        onDelete={openDeleteDialog}
      />

      <main className="pt-14">
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-2xl">
            <div className="flex flex-col items-start gap-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold">Create a project or open an existing one</h1>
                <p className="max-w-xl text-lg text-copy-secondary">
                  Start a new architecture workspace, or choose a project from the sidebar.
                </p>
              </div>

              <Button onClick={openCreateDialog} className="w-fit">
                <Plus className="size-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </main>

      <ProjectDialogs
        dialogMode={dialogMode}
        selectedProject={selectedProject}
        formName={formName}
        setFormName={setFormName}
        slugPreview={slugPreview}
        isSubmitting={isSubmitting}
        onClose={closeDialog}
        onSubmitCreate={submitCreate}
        onSubmitRename={submitRename}
        onSubmitDelete={submitDelete}
      />
    </div>
  );
}
