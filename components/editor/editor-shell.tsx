"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        rightSlot={<UserButton />}
      />
      <ProjectSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-14">
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-6 px-6 py-8">
          <div className="max-w-2xl rounded-3xl border border-surface-border bg-surface p-10 shadow-[0_24px_90px_rgba(0,0,0,0.12)]">
            <h1 className="text-3xl font-semibold">Welcome back</h1>
            <p className="mt-4 text-copy-secondary">
              Your editor workspace is ready. The account menu is available in the top-right corner.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
