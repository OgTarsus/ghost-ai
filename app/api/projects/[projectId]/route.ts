import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  });

  return NextResponse.json(updatedProject);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: projectId } });

  return new NextResponse(null, { status: 204 });
}
