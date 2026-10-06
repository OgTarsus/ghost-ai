import { NextResponse } from "next/server";

import { getCurrentClerkIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string; collaboratorId: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await getCurrentClerkIdentity();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, collaboratorId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}