"use client";

import Link from "next/link";
import { X, Plus, Pencil, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import type { Project } from "@/components/editor/use-project-dialogs";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  variant?: "overlay" | "workspace";
  activeProjectId?: string | null;
  onCreate: () => void;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  variant = "overlay",
  activeProjectId = null,
  onCreate,
  onRename,
  onDelete,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter((project) => project.isOwned);
  const sharedProjects = projects.filter((project) => !project.isOwned);
  const isWorkspace = variant === "workspace";

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[color:var(--bg-base)]/70 transition-opacity duration-300 md:hidden",
          isWorkspace && "lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          isWorkspace
            ? "fixed bottom-3 left-3 top-[4.75rem] z-40 w-[min(17rem,calc(100vw-1.5rem))] rounded-2xl border border-surface-border bg-surface shadow-lg transition-transform duration-300 lg:static lg:z-0 lg:h-auto lg:w-[17rem] lg:shrink-0 lg:translate-x-0"
            : "fixed left-0 top-0 z-50 h-full w-80 border-r border-surface-border bg-surface shadow-lg transition-transform duration-300",
          isOpen ? "translate-x-0" : cn("-translate-x-full", isWorkspace && "lg:hidden"),
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
                  <div className="flex flex-col gap-2 py-4">
                    {ownedProjects.map((project) => {
                      const isActive = project.id === activeProjectId;

                      return (
                        <div
                          key={project.id}
                          className={cn(
                            "group rounded-2xl border p-3 transition-colors",
                            isActive ? "border-brand bg-brand-dim" : "border-surface-border bg-subtle",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/editor/${project.id}`}
                              className="min-w-0 flex-1 rounded-xl px-1 py-1 text-left transition-colors hover:bg-elevated"
                            >
                              <p className="truncate font-medium text-copy-primary">{project.name}</p>
                              <p className="mt-1 text-xs text-copy-secondary">/{project.slug}</p>
                            </Link>
                            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                              <button
                                className="pointer-events-none rounded-lg p-2 text-copy-primary hover:bg-elevated group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
                                onClick={() => {
                                  onRename(project);
                                }}
                                aria-label={`Rename ${project.name}`}
                                title={`Rename ${project.name}`}
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                className="pointer-events-none rounded-lg p-2 text-red-500 hover:bg-elevated group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
                                onClick={() => {
                                  onDelete(project);
                                }}
                                aria-label={`Delete ${project.name}`}
                                title={`Delete ${project.name}`}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-copy-secondary">No projects yet</div>
                )}
              </TabsContent>

              <TabsContent value="shared">
                {sharedProjects.length > 0 ? (
                  <div className="flex flex-col gap-2 py-4">
                    {sharedProjects.map((project) => {
                      const isActive = project.id === activeProjectId;

                      return (
                        <div
                          key={project.id}
                          className={cn(
                            "rounded-2xl border p-3 transition-colors",
                            isActive ? "border-brand bg-brand-dim" : "border-surface-border bg-subtle",
                          )}
                        >
                          <Link
                            href={`/editor/${project.id}`}
                            className="block rounded-xl px-1 py-1 text-left transition-colors hover:bg-[color:var(--bg-elevated)]"
                          >
                            <p className="truncate font-medium text-copy-primary">{project.name}</p>
                            <p className="mt-1 text-xs text-copy-secondary">/{project.slug}</p>
                          </Link>
                        </div>
                      );
                    })}
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
