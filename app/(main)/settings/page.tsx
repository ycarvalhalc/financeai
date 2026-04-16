"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import type { AiModelId } from "@/lib/types";
import { AI_MODEL_IDS } from "@/lib/types";
import { AI_MODEL_LABELS } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const { user, hydrated, updateUser, logout } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [model, setModel] = useState<AiModelId>("gpt-4");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl ?? "");
      setModel(user.preferredAiModel);
    }
  }, [user]);

  if (!hydrated || !user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatarUrl: avatarUrl.trim() || undefined,
      preferredAiModel: model,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-xl animate-in-up space-y-10">
      <div>
        <h1 className="font-display text-3xl text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted">Dados pessoais e preferências da IA (conta Supabase).</p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-8 rounded-2xl border border-[var(--border)] bg-elevated/40 p-6 sm:p-8"
      >
        <section>
          <h2 className="font-display text-lg text-accent">Dados pessoais</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="set-name" className="mb-1 block text-xs uppercase tracking-wider text-muted">
                Nome
              </label>
              <input
                id="set-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
              />
            </div>
            <div>
              <label htmlFor="set-email" className="mb-1 block text-xs uppercase tracking-wider text-muted">
                E-mail
              </label>
              <input
                id="set-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
              />
            </div>
            <div>
              <label htmlFor="set-avatar" className="mb-1 block text-xs uppercase tracking-wider text-muted">
                URL da foto (opcional)
              </label>
              <input
                id="set-avatar"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-accent">Modelo de IA</h2>
          <p className="mt-1 text-xs text-muted">Usado nas análises quando integrarmos o backend.</p>
          <div className="mt-4">
            <label htmlFor="set-model" className="sr-only">
              Modelo preferido
            </label>
            <select
              id="set-model"
              value={model}
              onChange={(e) => setModel(e.target.value as AiModelId)}
              className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
            >
              {AI_MODEL_IDS.map((id) => (
                <option key={id} value={id}>
                  {AI_MODEL_LABELS[id] ?? id}
                </option>
              ))}
            </select>
          </div>
        </section>

        {saved && (
          <p className="text-sm text-success" role="status">
            Preferências salvas.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-background hover:bg-accent-dim focus-ring sm:w-auto sm:px-8"
        >
          Salvar alterações
        </button>
      </form>

      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
        <h2 className="font-display text-lg text-danger">Sessão</h2>
        <p className="mt-1 text-sm text-muted">Encerrar acesso neste dispositivo.</p>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-4 rounded-xl border border-danger/50 px-6 py-3 text-sm font-semibold text-danger transition hover:bg-danger/15 focus-ring"
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
