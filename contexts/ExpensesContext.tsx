"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Expense, ExpenseType, RecurringConfig } from "@/lib/types";
import { welcomeExpensesForUser } from "@/lib/mocks/seed";
import { loadExpenses, saveExpenses } from "@/lib/mocks/storage";
import { useSession } from "@/contexts/SessionContext";

type CreateExpenseInput = {
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  type: ExpenseType;
  recurring?: RecurringConfig;
};

type ExpensesState = {
  expenses: Expense[];
  hydrated: boolean;
  listForUser: (userId: string) => Expense[];
  createExpense: (userId: string, input: CreateExpenseInput) => Expense;
  updateExpense: (id: string, userId: string, patch: Partial<CreateExpenseInput>) => void;
  deleteExpense: (id: string, userId: string) => void;
  cancelRecurring: (id: string, userId: string) => void;
};

const ExpensesContext = createContext<ExpensesState | null>(null);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useSession();

  useEffect(() => {
    setExpenses(loadExpenses());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !user) return;
    const all = loadExpenses();
    const mine = all.filter((e) => e.userId === user.id);
    if (mine.length === 0) {
      const seeded = welcomeExpensesForUser(user.id);
      const merged = [...all.filter((e) => e.userId !== user.id), ...seeded];
      saveExpenses(merged);
      setExpenses(merged);
    }
  }, [hydrated, user]);

  const persist = useCallback((next: Expense[]) => {
    saveExpenses(next);
    setExpenses(next);
  }, []);

  const listForUser = useCallback(
    (userId: string) => expenses.filter((e) => e.userId === userId),
    [expenses],
  );

  const createExpense = useCallback(
    (userId: string, input: CreateExpenseInput): Expense => {
      const all = loadExpenses();
      const expense: Expense = {
        id: `exp-${crypto.randomUUID()}`,
        userId,
        title: input.title.trim(),
        amount: input.amount,
        date: input.date,
        categoryId: input.categoryId,
        type: input.type,
        recurring:
          input.type === "recorrente"
            ? input.recurring ?? { active: true, dayOfMonth: new Date(input.date).getDate() }
            : undefined,
      };
      const next = [...all, expense];
      persist(next);
      return expense;
    },
    [persist],
  );

  const updateExpense = useCallback(
    (id: string, userId: string, patch: Partial<CreateExpenseInput>) => {
      const all = loadExpenses();
      const next = all.map((e) => {
        if (e.id !== id || e.userId !== userId) return e;
        const type = patch.type ?? e.type;
        let recurring = e.recurring;
        if (type === "recorrente") {
          recurring = patch.recurring ?? e.recurring ?? { active: true };
        } else {
          recurring = undefined;
        }
        return {
          ...e,
          ...patch,
          title: patch.title !== undefined ? patch.title.trim() : e.title,
          type,
          recurring,
        };
      });
      persist(next);
    },
    [persist],
  );

  const deleteExpense = useCallback(
    (id: string, userId: string) => {
      const all = loadExpenses();
      persist(all.filter((e) => !(e.id === id && e.userId === userId)));
    },
    [persist],
  );

  const cancelRecurring = useCallback(
    (id: string, userId: string) => {
      const all = loadExpenses();
      const next = all.map((e) => {
        if (e.id !== id || e.userId !== userId) return e;
        return {
          ...e,
          type: "pontual" as const,
          recurring: { active: false },
        };
      });
      persist(next);
    },
    [persist],
  );

  const value = useMemo(
    () => ({
      expenses,
      hydrated,
      listForUser,
      createExpense,
      updateExpense,
      deleteExpense,
      cancelRecurring,
    }),
    [
      expenses,
      hydrated,
      listForUser,
      createExpense,
      updateExpense,
      deleteExpense,
      cancelRecurring,
    ],
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}
