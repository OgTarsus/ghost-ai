import { auth, currentUser } from "@clerk/nextjs/server";

export interface ClerkIdentity {
  userId: string | null;
  primaryEmail: string | null;
}

export interface ProjectAccessRecord {
  ownerId: string;
  collaborators?: Array<{ email: string }> | null;
}

export function normalizeProjectEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null;
}

export async function getCurrentClerkIdentity(): Promise<ClerkIdentity> {
  const { userId } = await auth();

  if (!userId) {
    return { userId: null, primaryEmail: null };
  }

  const user = await currentUser();

  if (!user) {
    return { userId, primaryEmail: null };
  }

  const primaryEmail =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  return {
    userId,
    primaryEmail,
  };
}

export function checkProjectAccess(
  project: ProjectAccessRecord | null | undefined,
  userId: string | null,
  primaryEmail: string | null,
) {
  if (!project || !userId) {
    return false;
  }

  if (project.ownerId === userId) {
    return true;
  }

  const normalizedEmail = normalizeProjectEmail(primaryEmail);

  if (!normalizedEmail) {
    return false;
  }

  return (project.collaborators ?? []).some((collaborator) => {
    return normalizeProjectEmail(collaborator.email) === normalizedEmail;
  });
}

export const hasProjectAccess = checkProjectAccess;

export async function getCurrentProjectAccess() {
  return getCurrentClerkIdentity();
}
