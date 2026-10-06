"use client";

import { useState } from "react";
import { Bot, Share2, Sparkles } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import type { Project } from "@/components/editor/use-project-dialogs";
import { Button } from "@/components/ui/button";

interface EditorRoomWorkspaceProps {
  project: Pick<Project, "id" | "name">;
  projects: Project[];
  isOwner: boolean;
}

export function EditorRoomWorkspace({ project, projects, isOwner }: EditorRoomWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        title={project.name}
        rightSlot={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-3"
              aria-label="Share project"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 className="size-4" />
              Share
            </Button>
            <Button
              type="button"
              variant={isAiSidebarOpen ? "default" : "secondary"}
              size="sm"
              className="h-9 px-3"
              aria-pressed={isAiSidebarOpen}
              aria-label={isAiSidebarOpen ? "Hide AI sidebar" : "Show AI sidebar"}
              title={isAiSidebarOpen ? "Hide AI sidebar" : "Show AI sidebar"}
              onClick={() => setIsAiSidebarOpen((open) => !open)}
            >
              <Sparkles className="size-4" />
              AI
            </Button>
            <UserButton />
          </div>
        }
      />

      <main className="relative flex min-h-0 flex-1 gap-3 px-3 pb-3 pt-[4.75rem]">
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          projects={projects}
          variant="workspace"
          activeProjectId={project.id}
          onCreate={() => undefined}
          onRename={() => undefined}
          onDelete={() => undefined}
        />

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-surface-border bg-base">
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent-primary) 11%, transparent), transparent 42%), radial-gradient(ellipse at 100% 100%, color-mix(in srgb, var(--accent-ai) 10%, transparent), transparent 36%), linear-gradient(to right, color-mix(in srgb, var(--border-default) 22%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--border-default) 22%, transparent) 1px, transparent 1px)",
              backgroundSize: "auto, auto, 52px 52px, 52px 52px",
            }}
          />
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 py-10">
            <div className="max-w-xl text-center">
              <h1 className="text-2xl font-medium text-copy-primary">
                Canvas and collaboration tooling land here next.
              </h1>
              <p className="mt-4 text-sm leading-6 text-copy-muted">
                This room is ready for the shared architecture canvas, durable AI workflows, and real-time presence.
                For now, the shell is wired with project context and navigation only.
              </p>
            </div>
          </div>
        </div>

        {isAiSidebarOpen ? (
          <aside className="fixed bottom-3 right-3 top-[4.75rem] z-30 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface lg:static lg:z-0 lg:w-80 lg:shrink-0">
            <div className="flex h-16 items-center justify-between border-b border-surface-border px-4">
              <div>
                <h2 className="text-sm font-medium">AI Copilot</h2>
                <p className="mt-0.5 text-xs text-copy-muted">Placeholder panel</p>
              </div>
              <Sparkles className="size-4 text-ai-accent-text" />
            </div>
            <div className="flex flex-1 flex-col justify-between gap-4 p-4">
              <div className="flex items-start gap-3 rounded-2xl border border-surface-border bg-subtle p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-ai-accent/15 text-ai-accent-text">
                  <Bot className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">Chat surface pending</p>
                  <p className="mt-1 text-xs leading-5 text-copy-muted">
                    The toggle is wired. Messaging and generation are intentionally out of scope here.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-surface-border p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-copy-muted">Future hooks</p>
                <p className="mt-2 text-sm leading-6 text-copy-secondary">
                  Prompt composer, run status, and architecture guidance will attach to this sidebar.
                </p>
              </div>
            </div>
          </aside>
        ) : null}
      </main>

      {isShareDialogOpen ? (
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          projectId={project.id}
          isOwner={isOwner}
        />
      ) : null}
    </div>
  );
}