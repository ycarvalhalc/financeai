"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AiModelId, User } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type SessionState = {
  user: User | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (
    patch: Partial<Pick<User, "name" | "email" | "avatarUrl" | "preferredAiModel">>,
  ) => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

function mapProfileToUser(
  sessionUser: { id: string; email?: string },
  profile: { name: string; avatar_url: string | null; preferred_ai_model: string } | null,
): User {
  return {
    id: sessionUser.id,
    email: sessionUser.email ?? "",
    name: profile?.name ?? "",
    avatarUrl: profile?.avatar_url ?? undefined,
    preferredAiModel: (profile?.preferred_ai_model ?? "gpt-4") as AiModelId,
  };
}

function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("user already registered")) return "Este e-mail já está cadastrado.";
  if (m.includes("password")) return "Senha inválida. Tente outra.";
  return msg || "Não foi possível concluir a operação.";
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const loadUser = useCallback(async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setUser(null);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, avatar_url, preferred_ai_model")
      .eq("id", authUser.id)
      .maybeSingle();
    setUser(mapProfileToUser(authUser, profile));
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await loadUser();
      if (!cancelled) setHydrated(true);
    })();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false as const, error: translateAuthError(error.message) };
      await loadUser();
      return { ok: true as const };
    },
    [supabase, loadUser],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            preferred_ai_model: "gpt-4",
          },
        },
      });
      if (error) return { ok: false as const, error: translateAuthError(error.message) };
      if (!data.session) {
        return {
          ok: false as const,
          error: "Confirme o link enviado ao seu e-mail para ativar a conta.",
        };
      }
      await loadUser();
      return { ok: true as const };
    },
    [supabase, loadUser],
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const updateUser = useCallback(
    async (patch: Partial<Pick<User, "name" | "email" | "avatarUrl" | "preferredAiModel">>) => {
      if (!user) return;
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      if (
        patch.email !== undefined &&
        patch.email.trim().toLowerCase() !== user.email.toLowerCase()
      ) {
        const { error } = await supabase.auth.updateUser({
          email: patch.email.trim().toLowerCase(),
        });
        if (error) {
          console.error(error);
          return;
        }
      }

      const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.name !== undefined) row.name = patch.name.trim();
      if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl.trim() || null;
      if (patch.preferredAiModel !== undefined) row.preferred_ai_model = patch.preferredAiModel;

      const { error: profErr } = await supabase.from("profiles").update(row).eq("id", user.id);
      if (profErr) {
        console.error(profErr);
        return;
      }

      await loadUser();
    },
    [user, supabase, loadUser],
  );

  const value = useMemo(
    () => ({
      user,
      hydrated,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, hydrated, login, register, logout, updateUser],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
