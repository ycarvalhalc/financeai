"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Category, Expense, ExpenseType, RecurringConfig } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { rowToExpense, type ExpenseRow } from "@/lib/supabase/mappers";
import { insertWelcomeExpenses } from "@/lib/welcome-expenses";
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
  categories: Category[];
  hydrated: boolean;
  listForUser: (userId: string) => Expense[];
  createExpense: (userId: string, input: CreateExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, userId: string, patch: Partial<CreateExpenseInput>) => Promise<void>;
  deleteExpense: (id: string, userId: string) => Promise<void>;
  cancelRecurring: (id: string, userId: string) => Promise<void>;
};

const ExpensesContext = createContext<ExpensesState | null>(null);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const { user, hydrated: sessionHydrated } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refreshExpenses = useCallback(
    async (uid: string) => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", uid)
        .order("date", { ascending: false });
      if (error) {
        console.error(error);
        return;
      }
      setExpenses((data ?? []).map((r) => rowToExpense(r as ExpenseRow)));
    },
    [supabase],
  );

  const refreshCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("*").order("id");
    if (error) {
      console.error(error);
      return;
    }
    setCategories((data ?? []) as Category[]);
  }, [supabase]);

  useEffect(() => {
    if (!sessionHydrated) return;

    if (!user) {
      setExpenses([]);
      setCategories([]);
      setHydrated(true);
      return;
    }

    setHydrated(false);
    let cancelled = false;

    void (async () => {
      await refreshCategories();
      await refreshExpenses(user.id);
      const { count, error: countErr } = await supabase
        .from("expenses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (countErr) console.error(countErr);
      if (!cancelled && (count ?? 0) === 0) {
        try {
          await insertWelcomeExpenses(supabase, user.id);
          await refreshExpenses(user.id);
        } catch (e) {
          console.error(e);
        }
      }
      if (!cancelled) setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionHydrated, user?.id, supabase, refreshExpenses, refreshCategories]);

  const listForUser = useCallback(
    (userId: string) => expenses.filter((e) => e.userId === userId),
    [expenses],
  );

  const createExpense = useCallback(
    async (userId: string, input: CreateExpenseInput): Promise<Expense> => {
      const recurring =
        input.type === "recorrente"
          ? (input.recurring ?? { active: true, dayOfMonth: new Date(input.date).getDate() })
          : null;
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          user_id: userId,
          title: input.title.trim(),
          amount: input.amount,
          date: input.date,
          category_id: input.categoryId,
          type: input.type,
          recurring,
        })
        .select()
        .single();
      if (error) throw error;
      const exp = rowToExpense(data as ExpenseRow);
      setExpenses((prev) => [...prev, exp]);
      return exp;
    },
    [supabase],
  );

  const updateExpense = useCallback(
    async (id: string, userId: string, patch: Partial<CreateExpenseInput>) => {
      const current = expenses.find((e) => e.id === id && e.userId === userId);
      const title = patch.title !== undefined ? patch.title.trim() : (current?.title ?? "");
      const amount = patch.amount !== undefined ? patch.amount : (current?.amount ?? 0);
      const date = patch.date !== undefined ? patch.date : (current?.date ?? "");
      const categoryId =
        patch.categoryId !== undefined ? patch.categoryId : (current?.categoryId ?? "");
      const type = patch.type !== undefined ? patch.type : (current?.type ?? "pontual");
      let recurring: RecurringConfig | null = null;
      if (type === "recorrente") {
        recurring =
          patch.recurring !== undefined
            ? patch.recurring
            : (current?.recurring ?? { active: true, dayOfMonth: new Date(date).getDate() });
      }

      const { data, error } = await supabase
        .from("expenses")
        .update({
          title,
          amount,
          date,
          category_id: categoryId,
          type,
          recurring,
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      const next = rowToExpense(data as ExpenseRow);
      setExpenses((prev) => prev.map((e) => (e.id === id ? next : e)));
    },
    [supabase, expenses],
  );

  const deleteExpense = useCallback(
    async (id: string, userId: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [supabase],
  );

  const cancelRecurring = useCallback(
    async (id: string, userId: string) => {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          type: "pontual",
          recurring: { active: false },
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      const next = rowToExpense(data as ExpenseRow);
      setExpenses((prev) => prev.map((e) => (e.id === id ? next : e)));
    },
    [supabase],
  );

  const value = useMemo(
    () => ({
      expenses,
      categories,
      hydrated,
      listForUser,
      createExpense,
      updateExpense,
      deleteExpense,
      cancelRecurring,
    }),
    [
      expenses,
      categories,
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
