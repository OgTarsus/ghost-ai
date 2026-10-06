"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Check, Link2, LoaderCircle, Mail, Trash2, UserRound, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  isOwner: boolean;
}

interface Collaborator {
  id: string;
  email: string;
  displayName: string | null;
  imageUrl: string | null;
}

interface OwnerProfile {
  displayName: string | null;
  email: string | null;
  imageUrl: string | null;
}

async function getApiError(response: Response) {
  const body: unknown = await response.json().catch(() => null);

  if (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string") {
    return body.error;
  }

  return "Something went wrong. Please try again.";
}

async function fetchCollaborators(projectId: string, signal?: AbortSignal) {
  const response = await fetch(`/api/projects/${projectId}/collaborators`, { signal });

  if (!response.ok) {
    throw new Error(await getApiError(response));
  }

  return (await response.json()) as { owner: OwnerProfile; collaborators: Collaborator[] };
}

export function ShareDialog({ open, onOpenChange, projectId, isOwner }: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [owner, setOwner] = useState<OwnerProfile>({ displayName: null, email: null, imageUrl: null });
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();

    void fetchCollaborators(projectId, controller.signal)
      .then((result) => {
        setOwner(result.owner);
        setCollaborators(result.collaborators);
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load collaborators");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [open, projectId]);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) {
        window.clearTimeout(copyTimer.current);
      }
    };
  }, []);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsInviting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setEmail("");
      const result = await fetchCollaborators(projectId);
      setOwner(result.owner);
      setCollaborators(result.collaborators);
    } catch (inviteError) {
      setError(inviteError instanceof Error ? inviteError.message : "Unable to invite collaborator");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (collaborator: Collaborator) => {
    setError(null);
    setRemovingId(collaborator.id);

    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators/${collaborator.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setCollaborators((current) => current.filter((item) => item.id !== collaborator.id));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove collaborator");
    } finally {
      setRemovingId(null);
    }
  };

  const handleCopyLink = async () => {
    setError(null);

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/editor/${projectId}`);
      setIsCopied(true);

      if (copyTimer.current !== null) {
        window.clearTimeout(copyTimer.current);
      }

      copyTimer.current = window.setTimeout(() => setIsCopied(false), 1800);
    } catch {
      setError("Unable to copy the project link");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[34rem] gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-surface-border px-6 py-4 pr-14">
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>Invite collaborators, copy the workspace link, and manage access.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          {isOwner ? (
            <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-subtle/50 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-copy-primary">Workspace link</p>
                <p className="mt-1 truncate text-xs text-copy-muted">
                  Share a direct link with teammates after you grant them access.
                </p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={handleCopyLink}>
                {isCopied ? <Check className="size-4" /> : <Link2 className="size-4" />}
                {isCopied ? "Copied!" : "Copy link"}
              </Button>
            </div>
          ) : null}

          {isOwner ? (
            <form
              onSubmit={handleInvite}
              className="flex items-center gap-2 rounded-2xl border border-surface-border bg-subtle/50 p-2"
            >
              <Mail className="ml-1 size-4 shrink-0 text-copy-muted" />
              <div className="min-w-0 flex-1">
                <Input
                  id="collaborator-email"
                  type="email"
                  autoComplete="email"
                  placeholder="teammate@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  aria-label="Collaborator email address"
                  className="h-9 border-transparent bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="sm" disabled={isInviting || !email.trim()}>
                {isInviting ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                Invite
              </Button>
            </form>
          ) : null}

          <section aria-labelledby="collaborator-list-title">
            <div className="mb-2 flex items-center justify-between">
              <h3 id="collaborator-list-title" className="text-sm font-medium text-copy-primary">
                People with access
              </h3>
              <span className="text-xs text-copy-muted">{collaborators.length + 1} total</span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-copy-muted">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading people...
                </div>
              ) : (
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 rounded-2xl border border-surface-border bg-subtle/40 p-3">
                    {owner.imageUrl ? (
                      <Image
                        src={owner.imageUrl}
                        alt=""
                        width={36}
                        height={36}
                        unoptimized
                        className="size-9 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-elevated text-copy-muted">
                        <UserRound className="size-4" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-copy-primary">
                        {owner.displayName ?? owner.email ?? "Project owner"}
                      </p>
                      {owner.displayName && owner.email ? (
                        <p className="truncate text-xs text-copy-muted">{owner.email}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full border border-brand/30 bg-brand-dim px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
                      Owner
                    </span>
                  </li>
                  {collaborators.map((collaborator) => (
                    <li
                      key={collaborator.id}
                      className="flex items-center gap-3 rounded-2xl border border-surface-border bg-subtle/40 p-3"
                    >
                      {collaborator.imageUrl ? (
                        <Image
                          src={collaborator.imageUrl}
                          alt=""
                          width={36}
                          height={36}
                          unoptimized
                          className="size-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-subtle text-copy-muted">
                          <UserRound className="size-4" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        {collaborator.displayName ? (
                          <>
                            <p className="truncate text-sm font-medium text-copy-primary">
                              {collaborator.displayName}
                            </p>
                            <p className="truncate text-xs text-copy-muted">{collaborator.email}</p>
                          </>
                        ) : (
                          <p className="truncate text-sm text-copy-primary">{collaborator.email}</p>
                        )}
                      </div>
                      <span className="hidden rounded-full border border-surface-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-copy-muted sm:inline-flex">
                        Collaborator
                      </span>
                      {isOwner ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${collaborator.email}`}
                          title={`Remove ${collaborator.email}`}
                          disabled={removingId === collaborator.id}
                          onClick={() => void handleRemove(collaborator)}
                        >
                          {removingId === collaborator.id ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {error ? <p className="text-sm text-state-error" role="alert">{error}</p> : null}
        </div>

        <div className="h-2 border-t border-surface-border" aria-hidden="true" />
      </DialogContent>
    </Dialog>
  );
}