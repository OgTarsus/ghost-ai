"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
      />
      <ProjectSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="pt-14">
        <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-6 px-6 py-8">
          <div className="max-w-2xl rounded-3xl border border-surface-border bg-surface p-10 shadow-[0_24px_90px_rgba(0,0,0,0.12)]">
            <h1 className="text-3xl font-semibold">Ghost AI</h1>
            <p className="mt-4 text-copy-secondary">
              Your editor shell is ready. Open the sidebar to view project navigation and keep the canvas content in place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button onClick={() => setIsSidebarOpen(true)}>Open Projects</Button>
              <Button variant="secondary">Launch Editor</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
