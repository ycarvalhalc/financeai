import type { Category, Expense } from "@/lib/types";

export const SEED_CATEGORIES: Category[] = [
  { id: "cat-alim", name: "Alimentação", color: "#e07a5f" },
  { id: "cat-mor", name: "Moradia", color: "#3d5a80" },
  { id: "cat-trans", name: "Transporte", color: "#81b29a" },
  { id: "cat-lazer", name: "Lazer", color: "#9b5de5" },
  { id: "cat-saude", name: "Saúde", color: "#00b4d8" },
  { id: "cat-out", name: "Outros", color: "#adb5bd" },
];

function sampleExpenses(userId: string): Expense[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return [
    {
      id: "exp-seed-1",
      userId,
      title: "Supermercado",
      amount: 420.5,
      date: `${y}-${m}-05`,
      categoryId: "cat-alim",
      type: "pontual",
    },
    {
      id: "exp-seed-2",
      userId,
      title: "Aluguel",
      amount: 1800,
      date: `${y}-${m}-01`,
      categoryId: "cat-mor",
      type: "recorrente",
      recurring: { active: true, dayOfMonth: 1 },
    },
    {
      id: "exp-seed-3",
      userId,
      title: "Uber / transporte",
      amount: 156.2,
      date: `${y}-${m}-12`,
      categoryId: "cat-trans",
      type: "pontual",
    },
    {
      id: "exp-seed-4",
      userId,
      title: "Streaming",
      amount: 55.9,
      date: `${y}-${m}-08`,
      categoryId: "cat-lazer",
      type: "recorrente",
      recurring: { active: true, dayOfMonth: 8 },
    },
    {
      id: "exp-seed-5",
      userId,
      title: "Farmácia",
      amount: 89,
      date: `${y}-${m}-18`,
      categoryId: "cat-saude",
      type: "pontual",
    },
    {
      id: "exp-seed-6",
      userId,
      title: "Restaurante",
      amount: 210,
      date: `${y}-${m}-22`,
      categoryId: "cat-alim",
      type: "pontual",
    },
  ];
}

export function welcomeExpensesForUser(userId: string): Expense[] {
  return sampleExpenses(userId);
}
