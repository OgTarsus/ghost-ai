"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { Bot, Share2, Sparkles } from "lucide-react";

import { EditorCanvasRoom } from "@/components/editor/editor-canvas";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import type { Project } from "@/components/editor/use-project-dialogs";
import { Button } from "@/components/ui/button";

interface EditorRoomWorkspaceProps {
  project: Pick<Project, "id" | "name">;
  projects: Project[];
  isOwner: boolean;
  roomId: string;
}

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function EditorRoomWorkspace({ project, projects, isOwner, roomId }: EditorRoomWorkspaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveRequestRef = useRef<(() => Promise<void>) | null>(null);
  const handleSave = useCallback(() => {
    if (saveRequestRef.current) {
      void saveRequestRef.current();
    }
  }, []);
  const isMounted = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        title={project.name}
        showWorkspaceSave
        workspaceSaveState={saveStatus}
        onWorkspaceSave={handleSave}
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
          </div>
        }
      />

      <main className="relative flex min-h-0 flex-1 overflow-hidden bg-base pt-[4.75rem]">
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

        <div className="relative flex min-w-0 flex-1 overflow-hidden bg-base">
          <div className="pointer-events-none absolute inset-0 canvas-dot-background" />
          <div className="relative h-full w-full min-h-0">
            <EditorCanvasRoom
              roomId={roomId}
              projectId={project.id}
              onSaveStatusChange={setSaveStatus}
              onSaveRequest={(save) => {
                saveRequestRef.current = save;
              }}
            />
          </div>
        </div>

        <aside
          className={[
            "fixed bottom-3 right-3 top-[4.75rem] z-40 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col overflow-hidden border border-surface-border bg-surface/85 shadow-lg shadow-black/25 backdrop-blur-sm transition-transform duration-300 lg:w-80",
            isAiSidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+1.5rem)]",
          ].join(" ")}
        >
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