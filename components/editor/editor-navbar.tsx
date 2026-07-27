"use client";

import * as React from "react";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar }: EditorNavbarProps) {
  return (
    <header className={cn("fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between px-4", "bg-surface border-b border-surface-border") }>
      <div className="flex items-center gap-2">
        {!isSidebarOpen ? (
          <Button variant="ghost" size="lg" onClick={onToggleSidebar} aria-label="Open sidebar">
            <PanelLeftOpen className="h-6 w-6" />
          </Button>
        ) : null}
      </div>

      <div className="flex-1 flex items-center justify-center text-copy-secondary">{/* center (empty for now) */}</div>

      <div className="flex items-center gap-2">{/* right (reserved) */}</div>
    </header>
  );
}

export default EditorNavbar;
