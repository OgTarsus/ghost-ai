"use client";

import * as React from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function EditorNavbar({ isSidebarOpen, onToggleSidebar, title, leftSlot, rightSlot }: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4",
        title ? "h-16" : "h-14",
        "bg-surface border-b border-surface-border",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {leftSlot ?? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Close projects sidebar" : "Open projects sidebar"}
            title={isSidebarOpen ? "Close projects sidebar" : "Open projects sidebar"}
          >
            {isSidebarOpen ? <PanelLeftClose className="size-6" /> : <PanelLeftOpen className="size-6" />}
          </Button>
        )}
        {title ? (
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-copy-primary">{title}</span>
            <span className="text-xs text-copy-muted">Workspace</span>
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-4">
        {!title ? <div className="h-4 w-28 rounded-full bg-subtle/70" aria-hidden="true" /> : null}
      </div>

      <div className="flex items-center gap-2">{rightSlot}</div>
    </header>
  );
}

export default EditorNavbar;
