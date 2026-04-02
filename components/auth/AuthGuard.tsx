"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !user) router.replace("/");
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent"
          aria-hidden
        />
        <span className="sr-only">Carregando…</span>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
