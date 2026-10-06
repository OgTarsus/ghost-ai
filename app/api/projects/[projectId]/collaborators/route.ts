import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { checkProjectAccess, getCurrentClerkIdentity, normalizeProjectEmail } from "@/lib/project-access";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: { orderBy: { createdAt: "asc" } } },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (!checkProjectAccess(project, identity.userId, identity.primaryEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let owner = { displayName: null as string | null, email: null as string | null, imageUrl: null as string | null };
  const profilesByEmail = new Map<string, { displayName: string | null; imageUrl: string | null }>();

  try {
    const clerk = await clerkClient();
    const ownerUser = await clerk.users.getUser(project.ownerId);
    owner = {
      displayName: ownerUser.fullName ?? ownerUser.username,
      email: ownerUser.primaryEmailAddress?.emailAddress ?? ownerUser.emailAddresses[0]?.emailAddress ?? null,
      imageUrl: ownerUser.imageUrl || null,
    };
  } catch (error) {
    console.error("Unable to load the project owner profile from Clerk", error);
  }

  if (project.collaborators.length > 0) {
    try {
      const clerk = await clerkClient();
      const { data: users } = await clerk.users.getUserList({
        emailAddress: project.collaborators.map((collaborator) => collaborator.email),
        limit: project.collaborators.length,
      });

      for (const user of users) {
        const profile = {
          displayName: user.fullName ?? user.username,
          imageUrl: user.imageUrl || null,
        };

        for (const emailAddress of user.emailAddresses) {
          const email = normalizeProjectEmail(emailAddress.emailAddress);
          if (email) {
            profilesByEmail.set(email, profile);
          }
        }
      }
    } catch (error) {
      console.error("Unable to enrich collaborator profiles from Clerk", error);
    }
  }

  const collaborators = project.collaborators.map((collaborator) => {
    const email = normalizeProjectEmail(collaborator.email) ?? collaborator.email;
    const profile = profilesByEmail.get(email);

    return {
      id: collaborator.id,
      email: collaborator.email,
      displayName: profile?.displayName ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  });

  return NextResponse.json({ owner, collaborators });
}

export async function POST(request: Request, { params }: RouteContext) {
  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== identity.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const rawEmail =
    typeof body === "object" && body !== null && "email" in body && typeof body.email === "string"
      ? body.email
      : "";
  const email = normalizeProjectEmail(rawEmail);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const result = await prisma.projectCollaborator.createMany({
    data: { projectId, email },
    skipDuplicates: true,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "This email already has access" }, { status: 409 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}