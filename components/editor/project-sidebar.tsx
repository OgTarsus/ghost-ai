"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed left-0 top-0 z-50 h-full w-80 bg-surface shadow-lg transition-transform duration-300 border-r border-surface-border",
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
              <div className="py-8 text-center text-copy-secondary">No projects yet</div>
            </TabsContent>

            <TabsContent value="shared">
              <div className="py-8 text-center text-copy-secondary">No shared projects yet</div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="border-t border-surface-border p-4">
          <Button className="w-full" variant="default">
            <Plus className="size-4" />
            New Project
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default ProjectSidebar;
