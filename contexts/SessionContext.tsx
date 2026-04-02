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
import { loadUsers, loadSessionUserId, saveSessionUserId, saveUsers } from "@/lib/mocks/storage";

type SessionState = {
  user: User | null;
  hydrated: boolean;
  login: (email: string, _password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, _password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateUser: (patch: Partial<Pick<User, "name" | "email" | "avatarUrl" | "preferredAiModel">>) => void;
};

const SessionContext = createContext<SessionState | null>(null);

function findUserByEmail(users: User[], email: string) {
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const users = loadUsers();
    const sid = loadSessionUserId();
    if (sid) {
      const u = users.find((x) => x.id === sid);
      setUser(u ?? null);
    }
    setHydrated(true);
  }, []);

  const persistUser = useCallback((next: User | null) => {
    setUser(next);
    saveSessionUserId(next?.id ?? null);
  }, []);

  const login = useCallback(
    async (email: string, _password: string) => {
      const users = loadUsers();
      const u = findUserByEmail(users, email);
      if (!u) return { ok: false, error: "E-mail não encontrado. Cadastre-se primeiro." };
      persistUser(u);
      return { ok: true };
    },
    [persistUser],
  );

  const register = useCallback(
    async (name: string, email: string, _password: string) => {
      const users = loadUsers();
      if (findUserByEmail(users, email)) {
        return { ok: false, error: "Este e-mail já está cadastrado." };
      }
      const newUser: User = {
        id: `user-${crypto.randomUUID()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        preferredAiModel: "gpt-4" as AiModelId,
      };
      const next = [...users, newUser];
      saveUsers(next);
      persistUser(newUser);
      return { ok: true };
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback(
    (patch: Partial<Pick<User, "name" | "email" | "avatarUrl" | "preferredAiModel">>) => {
      if (!user) return;
      const users = loadUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx < 0) return;
      const nextUser = { ...user, ...patch };
      const nextUsers = [...users];
      nextUsers[idx] = nextUser;
      saveUsers(nextUsers);
      setUser(nextUser);
    },
    [user],
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
