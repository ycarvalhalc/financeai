"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/contexts/SessionContext";

export function GuestGate({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  if (user) return null;

  return <>{children}</>;
}
