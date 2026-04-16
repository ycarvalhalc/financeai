import type { Expense, RecurringConfig } from "@/lib/types";

export type ExpenseRow = {
  id: string;
  user_id: string;
  title: string;
  amount: string | number;
  date: string;
  category_id: string;
  type: "pontual" | "recorrente";
  recurring: RecurringConfig | null;
};

export function rowToExpense(row: ExpenseRow): Expense {
  const dateStr =
    typeof row.date === "string" && row.date.length >= 10 ? row.date.slice(0, 10) : String(row.date);
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: typeof row.amount === "number" ? row.amount : Number(row.amount),
    date: dateStr,
    categoryId: row.category_id,
    type: row.type,
    recurring: row.recurring ?? undefined,
  };
}
