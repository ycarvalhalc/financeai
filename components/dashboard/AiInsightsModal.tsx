"use client";

import { useMemo } from "react";
import type { Category, Expense } from "@/lib/types";
import { formatBRL } from "@/lib/format";

function buildInsights(expenses: Expense[], categories: Category[]): string[] {
  if (expenses.length === 0) {
    return [
      "Cadastre despesas para que a IA possa identificar padrões e sugerir economia.",
      "Use categorias consistentes para comparar meses com mais precisão.",
    ];
  }
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCat = new Map<string, number>();
  for (const e of expenses) {
    const cat = categories.find((c) => c.id === e.categoryId)?.name ?? "Outros";
    byCat.set(cat, (byCat.get(cat) ?? 0) + e.amount);
  }
  const sorted = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  const second = sorted[1];
  const tips: string[] = [
    `No mês atual, seu gasto total foi de ${formatBRL(total)}.`,
    top
      ? `A categoria "${top[0]}" concentra ${formatBRL(top[1])} (${((top[1] / total) * 100).toFixed(0)}% do total) — vale definir um teto ou revisar assinaturas.`
      : "",
    second
      ? `"${second[0]}" aparece em segundo lugar (${formatBRL(second[1])}). Pequenos ajustes aqui somam ao fim do ano.`
      : "",
    "Simulação: reduzir 10% nos dois maiores grupos libera caixa para reserva de emergência.",
    "Próximo passo: no histórico, filtre por mês e cancele recorrências que não usa mais.",
  ].filter(Boolean);
  return tips;
}

export function AiInsightsModal({
  open,
  onClose,
  expenses,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  expenses: Expense[];
  categories: Category[];
}) {
  const insights = useMemo(() => buildInsights(expenses, categories), [expenses, categories]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="modal-animate relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-elevated p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Central de IA</p>
            <h2 id="ai-modal-title" className="font-display mt-1 text-2xl text-foreground">
              Recomendações do mês
            </h2>
            <p className="mt-1 text-sm text-muted">Análise determinística com base nos seus lançamentos atuais.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-background hover:text-foreground focus-ring"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </div>
        <ul className="space-y-3 text-sm leading-relaxed text-foreground/90">
          {insights.map((line, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-[var(--border)] bg-background/50 px-4 py-3"
            >
              <span className="mt-0.5 font-display text-accent">{i + 1}.</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-[var(--border)] py-3 text-sm font-medium text-foreground transition hover:bg-background focus-ring"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
