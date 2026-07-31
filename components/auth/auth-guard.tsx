"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requireAuth,
  redirectTo = "/sign-in",
  fallback = null,
}: AuthGuardProps) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (requireAuth && !userId) {
      router.replace(redirectTo);
      return;
    }

    if (!requireAuth && userId) {
      router.replace("/editor");
    }
  }, [isLoaded, requireAuth, redirectTo, router, userId]);

  if (!isLoaded) {
    return <>{fallback}</>;
  }

  if (requireAuth && !userId) {
    return <>{fallback}</>;
  }

  if (!requireAuth && userId) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
