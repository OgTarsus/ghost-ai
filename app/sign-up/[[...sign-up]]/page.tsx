import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-base px-4 py-10 text-copy-primary sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col overflow-hidden rounded-3xl border border-surface-border bg-surface shadow-[0_24px_90px_rgba(0,0,0,0.12)] lg:flex-row">
        <div className="flex flex-col justify-center border-b border-surface-border px-8 py-10 lg:w-[44%] lg:border-b-0 lg:border-r lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand/40 bg-brand/10 text-brand">
              <span className="text-lg font-semibold">G</span>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-copy-muted">Ghost AI</p>
              <p className="text-sm text-copy-secondary">Create your workspace and continue.</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 text-sm text-copy-secondary">
            <p className="text-base font-medium text-copy-primary">Set up your account in a few steps.</p>
            <ul className="space-y-2">
              <li>• Start with a polished editor experience.</li>
              <li>• Keep your projects and collaborators in sync.</li>
              <li>• Move from idea to execution without friction.</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <SignUp
              path="/sign-up"
              routing="path"
              // forceRedirectUrl="/editor"
              signInUrl="/sign-in"
              fallback={<div className="text-center text-copy-secondary">Loading sign-up…</div>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
