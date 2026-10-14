import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { checkProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

function isValidCanvasPayload(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.nodes) && Array.isArray(candidate.edges);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, collaborators: { select: { email: true } } },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!checkProjectAccess(project, identity.userId, identity.primaryEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ nodes: [], edges: [] });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, collaborators: { select: { email: true } } },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const identity = await getCurrentClerkIdentity();
  if (!checkProjectAccess(project, identity.userId ?? userId, identity.primaryEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);

  if (!isValidCanvasPayload(body)) {
    return NextResponse.json({ error: "A valid canvas payload is required" }, { status: 400 });
  }

  return NextResponse.json({ success: true, nodes: (body as { nodes: unknown[] }).nodes, edges: (body as { edges: unknown[] }).edges });
}
