"use client";

import { SessionProvider } from "@/contexts/SessionContext";
import { ExpensesProvider } from "@/contexts/ExpensesContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ExpensesProvider>{children}</ExpensesProvider>
    </SessionProvider>
  );
}
