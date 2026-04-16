"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Category, Expense } from "@/lib/types";
import { formatBRL } from "@/lib/format";

type Props = {
  items: Expense[];
  categories: Category[];
  /** Abre o modal de nova despesa (ex.: painel). Se ausente, link para /expenses. */
  onNewExpense?: () => void;
};

export function RecentExpenses({ items, categories, onNewExpense }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-elevated/40 p-8 text-center text-muted">
        <p>Nenhuma despesa ainda.</p>
        {onNewExpense ? (
          <button
            type="button"
            onClick={onNewExpense}
            className="mt-2 inline-block text-sm text-accent underline-offset-4 hover:underline"
          >
            Lançar primeiro gasto
          </button>
        ) : (
          <Link href="/expenses" className="mt-2 inline-block text-sm text-accent hover:underline">
            Ir para despesas
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in-up animate-delay-3 rounded-2xl border border-[var(--border)] bg-elevated/40 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground">Despesas recentes</h3>
        <Link href="/expenses" className="text-xs font-medium text-accent hover:underline">
          Ver todas
        </Link>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {items.map((e) => {
          const cat = categories.find((c) => c.id === e.categoryId);
          return (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
              <div>
                <p className="font-medium text-foreground">{e.title}</p>
                <p className="text-xs text-muted">
                  {format(new Date(e.date + "T12:00:00"), "d MMM yyyy", { locale: ptBR })} ·{" "}
                  <span style={{ color: cat?.color }}>{cat?.name}</span>
                  {e.type === "recorrente" && e.recurring?.active && (
                    <span className="ml-1 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] uppercase text-accent">
                      Recorrente
                    </span>
                  )}
                </p>
              </div>
              <span className="font-mono text-sm text-foreground">{formatBRL(e.amount)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
