import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/editor/access-denied";
import { EditorRoomWorkspace } from "@/components/editor/editor-room-workspace";
import prisma from "@/lib/prisma";
import { checkProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access";

export default async function EditorRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const { userId, primaryEmail } = await getCurrentClerkIdentity();

  if (!userId) {
    redirect("/sign-in");
  }

  const project = await prisma.project.findUnique({
    where: { id: roomId },
    include: { collaborators: true },
  });

  if (!project || !checkProjectAccess(project, userId, primaryEmail)) {
    return <AccessDenied />;
  }

  const accessibleProjects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { collaborators: { some: { email: primaryEmail ?? "" } } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { collaborators: true },
  });

  const sidebarProjects = accessibleProjects.map((accessibleProject) => ({
    id: accessibleProject.id,
    name: accessibleProject.name,
    slug: accessibleProject.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project",
    isOwned: accessibleProject.ownerId === userId,
  }));

  return (
    <EditorRoomWorkspace
      project={{ id: project.id, name: project.name }}
      projects={sidebarProjects}
      isOwner={project.ownerId === userId}
    />
  );
}
