"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/contexts/SessionContext";

const nav = [
  { href: "/dashboard", label: "Painel" },
  { href: "/expenses", label: "Despesas" },
  { href: "/settings", label: "Configurações" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSession();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="font-display text-xl tracking-tight text-foreground transition hover:text-accent"
          >
            Financy<span className="text-accent"> IA</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Principal">
            {nav.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-elevated text-accent"
                      : "text-muted hover:bg-elevated/60 hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-2 sm:flex">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full border border-[var(--border)] object-cover"
              />
            ) : null}
            <p className="max-w-[10rem] truncate text-right text-xs text-muted">{user?.name}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
