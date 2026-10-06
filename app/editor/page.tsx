import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
import prisma from "@/lib/prisma";
import { getCurrentClerkIdentity } from "@/lib/project-access";

function toSidebarProject(project: { id: string; name: string; ownerId: string }) {
  return {
    id: project.id,
    name: project.name,
    slug: project.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project",
    isOwned: project.ownerId === "",
  };
}

export default async function EditorPage() {
  const { userId, primaryEmail } = await getCurrentClerkIdentity();

  if (!userId) {
    redirect("/sign-in");
  }

  const [ownedProjects, sharedProjects] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    }),
    primaryEmail
      ? prisma.project.findMany({
          where: {
            collaborators: {
              some: {
                email: primaryEmail,
              },
            },
            NOT: {
              ownerId: userId,
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  const projects = [
    ...ownedProjects.map((project) => ({
      ...toSidebarProject(project),
      isOwned: true,
    })),
    ...sharedProjects.map((project) => ({
      ...toSidebarProject(project),
      isOwned: false,
    })),
  ];

  return <EditorShell initialProjects={projects} />;
}
