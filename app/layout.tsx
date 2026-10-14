import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env.local or .env file before running the app.",
  );
}

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "A focused workspace for planning and collaboration",
};

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorBackground: "var(--bg-surface)",
    colorInputBackground: "var(--bg-subtle)",
    colorText: "var(--text-primary)",
    colorTextSecondary: "var(--text-secondary)",
    colorTextMuted: "var(--text-muted)",
    colorBorder: "var(--border-default)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          publishableKey={clerkPublishableKey}
          appearance={clerkAppearance}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
