"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/contexts/SessionContext";

type Tab = "login" | "register";

export function AuthPanel() {
  const router = useRouter();
  const { login, register } = useSession();
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const r = await login(email, password);
    setPending(false);
    if (r.ok) router.push("/dashboard");
    else setError(r.error ?? "Não foi possível entrar.");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const r = await register(name, email, password);
    setPending(false);
    if (r.ok) router.push("/dashboard");
    else setError(r.error ?? "Não foi possível cadastrar.");
  }

  return (
    <div className="w-full max-w-md animate-in-up rounded-2xl border border-[var(--border)] bg-elevated/90 p-8 shadow-2xl shadow-black/40 backdrop-blur-sm">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl tracking-tight text-foreground">
          Financy<span className="text-accent"> IA</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Finanças pessoais com análises inteligentes para reduzir custos.
        </p>
      </div>

      <div
        className="mb-6 flex rounded-xl bg-background p-1"
        role="tablist"
        aria-label="Autenticação"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "login"}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
            tab === "login" ? "bg-elevated text-accent shadow-sm" : "text-muted hover:text-foreground"
          }`}
          onClick={() => {
            setTab("login");
            setError(null);
          }}
        >
          Entrar
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "register"}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
            tab === "register" ? "bg-elevated text-accent shadow-sm" : "text-muted hover:text-foreground"
          }`}
          onClick={() => {
            setTab("register");
            setError(null);
          }}
        >
          Cadastro
        </button>
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground placeholder:text-muted focus-ring"
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-background transition hover:bg-accent-dim disabled:opacity-50"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
              Nome
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
              E-mail
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
              Senha
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-background transition hover:bg-accent-dim disabled:opacity-50"
          >
            {pending ? "Criando conta…" : "Criar conta"}
          </button>
        </form>
      )}
    </div>
  );
}
