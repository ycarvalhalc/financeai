import type { SupabaseClient } from "@supabase/supabase-js";

/** Insere despesas de boas-vindas quando o usuário ainda não tem lançamentos. */
export async function insertWelcomeExpenses(supabase: SupabaseClient, userId: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rows = [
    {
      user_id: userId,
      title: "Supermercado",
      amount: 420.5,
      date: `${y}-${m}-05`,
      category_id: "cat-alim",
      type: "pontual" as const,
      recurring: null,
    },
    {
      user_id: userId,
      title: "Aluguel",
      amount: 1800,
      date: `${y}-${m}-01`,
      category_id: "cat-mor",
      type: "recorrente" as const,
      recurring: { active: true, dayOfMonth: 1 },
    },
    {
      user_id: userId,
      title: "Uber / transporte",
      amount: 156.2,
      date: `${y}-${m}-12`,
      category_id: "cat-trans",
      type: "pontual" as const,
      recurring: null,
    },
    {
      user_id: userId,
      title: "Streaming",
      amount: 55.9,
      date: `${y}-${m}-08`,
      category_id: "cat-lazer",
      type: "recorrente" as const,
      recurring: { active: true, dayOfMonth: 8 },
    },
    {
      user_id: userId,
      title: "Farmácia",
      amount: 89,
      date: `${y}-${m}-18`,
      category_id: "cat-saude",
      type: "pontual" as const,
      recurring: null,
    },
    {
      user_id: userId,
      title: "Restaurante",
      amount: 210,
      date: `${y}-${m}-22`,
      category_id: "cat-alim",
      type: "pontual" as const,
      recurring: null,
    },
  ];

  const { error } = await supabase.from("expenses").insert(rows);
  if (error) throw error;
}
