import Link from "next/link";
import { Lock } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-6">
      <div className="w-full max-w-md rounded-3xl border border-surface-border bg-surface p-8 text-center shadow-[0_0_0_1px_rgba(42,42,48,0.4)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-dim text-brand">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-copy-primary">Access denied</h1>
        <p className="mt-3 text-sm text-copy-secondary">
          You do not have permission to open this project workspace.
        </p>
        <Link
          href="/editor"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-medium text-[color:var(--bg-base)] transition-colors hover:bg-[color:var(--accent-primary)]"
        >
          Back to editor
        </Link>
      </div>
    </div>
  );
}
