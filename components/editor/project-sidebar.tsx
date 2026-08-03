"use client";

import { X, Plus, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { Project } from "@/components/editor/use-project-dialogs";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onCreate: () => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectSidebar({ isOpen, onClose, projects, onCreate, onRename, onDelete }: ProjectSidebarProps) {
  const ownedProjects = projects.filter((project) => project.isOwned);
  const sharedProjects = projects.filter((project) => !project.isOwned);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[color:var(--bg-base)]/70 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 border-r border-surface-border bg-surface shadow-lg transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
            <h3 className="text-sm font-semibold">Projects</h3>
            <button className="rounded-xl p-1 text-copy-secondary hover:bg-subtle" onClick={onClose} aria-label="Close projects">
              <X className="size-6" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <Tabs defaultValue="my">
              <TabsList>
                <TabsTrigger value="my">My Projects</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
              </TabsList>

              <TabsContent value="my">
                {ownedProjects.length > 0 ? (
                  <div className="space-y-2 py-4">
                    {ownedProjects.map((project) => (
                      <div key={project.id} className="rounded-2xl border border-surface-border bg-subtle p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-copy-primary">{project.name}</p>
                            <p className="mt-1 text-xs text-copy-secondary">/{project.slug}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              className="rounded-lg p-2 text-copy-primary hover:bg-elevated"
                              onClick={() => onRename(project)}
                              aria-label={`Rename ${project.name}`}
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-red-500 hover:bg-elevated"
                              onClick={() => onDelete(project)}
                              aria-label={`Delete ${project.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-copy-secondary">No projects yet</div>
                )}
              </TabsContent>

              <TabsContent value="shared">
                {sharedProjects.length > 0 ? (
                  <div className="space-y-2 py-4">
                    {sharedProjects.map((project) => (
                      <div key={project.id} className="rounded-2xl border border-surface-border bg-subtle p-3">
                        <p className="truncate font-medium text-copy-primary">{project.name}</p>
                        <p className="mt-1 text-xs text-copy-secondary">/{project.slug}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-copy-secondary">No shared projects yet</div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="border-t border-surface-border p-4">
            <Button className="w-full" variant="default" onClick={onCreate}>
              <Plus className="size-4" />
              New Project
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default ProjectSidebar;
