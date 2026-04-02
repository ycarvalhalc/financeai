import type { Expense, User } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/mocks/constants";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadUsers(): User[] {
  return readJson<User[]>(STORAGE_KEYS.users, []);
}

export function saveUsers(users: User[]) {
  writeJson(STORAGE_KEYS.users, users);
}

export function loadSessionUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.sessionUserId);
}

export function saveSessionUserId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id === null) localStorage.removeItem(STORAGE_KEYS.sessionUserId);
  else localStorage.setItem(STORAGE_KEYS.sessionUserId, id);
}

export function loadExpenses(): Expense[] {
  return readJson<Expense[]>(STORAGE_KEYS.expenses, []);
}

export function saveExpenses(expenses: Expense[]) {
  writeJson(STORAGE_KEYS.expenses, expenses);
}
