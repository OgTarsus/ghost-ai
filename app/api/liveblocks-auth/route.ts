import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { checkProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access";
import { getCursorColorForUserId, getLiveblocksClient } from "@/lib/liveblocks";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "forbidden", reason: "Unauthorized" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const roomId =
    typeof body === "object" && body !== null
      ? "room" in body && typeof body.room === "string"
        ? body.room
        : "projectId" in body && typeof body.projectId === "string"
          ? body.projectId
          : null
      : null;

  if (!roomId) {
    return NextResponse.json({ error: "forbidden", reason: "Room ID is required" }, { status: 403 });
  }

  const identity = await getCurrentClerkIdentity();

  if (!identity.userId) {
    return NextResponse.json({ error: "forbidden", reason: "Unauthorized" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id: roomId },
    include: { collaborators: true },
  });

  if (!project || !checkProjectAccess(project, identity.userId, identity.primaryEmail)) {
    return NextResponse.json({ error: "forbidden", reason: "Forbidden" }, { status: 403 });
  }

  const user = await currentUser();
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    user?.emailAddresses[0]?.emailAddress ||
    "Anonymous user";
  const avatar = user?.imageUrl ?? "";
  const color = getCursorColorForUserId(userId);

  const client = getLiveblocksClient();

  await client.getOrCreateRoom(roomId, {
    defaultAccesses: [],
    metadata: { projectId: roomId },
  });

  const session = client.prepareSession(userId, {
    userInfo: {
      name: displayName,
      avatar,
      color,
    },
  });

  session.allow(roomId, ["*:write"]);

  const authResponse = await session.authorize();

  if (authResponse.status !== 200 || !authResponse.body) {
    console.error("Liveblocks authorization failed", authResponse.error);
    return NextResponse.json({ error: "forbidden", reason: "Unable to issue room token" }, { status: 403 });
  }

  return new Response(authResponse.body, {
    status: authResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}
