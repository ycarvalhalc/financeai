"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import type { Expense, ExpenseType } from "@/lib/types";
import { SEED_CATEGORIES } from "@/lib/mocks/seed";

const schema = z.object({
  title: z.string().trim().min(1, "Informe o título"),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  date: z.string().min(1, "Informe a data"),
  categoryId: z.string().min(1, "Escolha uma categoria"),
  type: z.enum(["pontual", "recorrente"]),
  dayOfMonth: z.coerce.number().min(1).max(28).optional(),
});

type Props = {
  initial?: Partial<Expense>;
  submitLabel: string;
  /** Se definido, exibe botão Cancelar que chama esta função em vez do link para /expenses. */
  onCancel?: () => void;
  onSubmit: (values: {
    title: string;
    amount: number;
    date: string;
    categoryId: string;
    type: ExpenseType;
    recurring?: { active: boolean; dayOfMonth?: number };
  }) => Promise<void> | void;
};

export function ExpenseForm({ initial, submitLabel, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? SEED_CATEGORIES[0]?.id ?? "");
  const [type, setType] = useState<ExpenseType>(initial?.type ?? "pontual");
  const [recurring, setRecurring] = useState(initial?.recurring?.active ?? false);
  const [dayOfMonth, setDayOfMonth] = useState(
    String(initial?.recurring?.dayOfMonth ?? new Date().getDate()),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({
      title,
      amount,
      date,
      categoryId,
      type,
      dayOfMonth: type === "recorrente" ? Number(dayOfMonth) : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Dados inválidos");
      return;
    }
    const v = parsed.data;
    setPending(true);
    try {
      await onSubmit({
        title: v.title,
        amount: v.amount,
        date: v.date,
        categoryId: v.categoryId,
        type: v.type,
        recurring:
          v.type === "recorrente"
            ? { active: recurring, dayOfMonth: v.dayOfMonth ?? new Date(v.date).getDate() }
            : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="exp-title" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
          Título
        </label>
        <input
          id="exp-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
          placeholder="Ex.: Conta de luz"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="exp-amount" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
            Valor (R$)
          </label>
          <input
            id="exp-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
          />
        </div>
        <div>
          <label htmlFor="exp-date" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
            Data
          </label>
          <input
            id="exp-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
          />
        </div>
      </div>

      <div>
        <label htmlFor="exp-cat" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted">
          Categoria
        </label>
        <select
          id="exp-cat"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-foreground focus-ring"
        >
          {SEED_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="rounded-xl border border-[var(--border)] bg-background/40 p-4">
        <legend className="px-1 text-xs font-medium uppercase tracking-wider text-muted">Tipo</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="exp-type"
              checked={type === "pontual"}
              onChange={() => setType("pontual")}
              className="accent-accent"
            />
            Pontual
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="exp-type"
              checked={type === "recorrente"}
              onChange={() => setType("recorrente")}
              className="accent-accent"
            />
            Recorrente
          </label>
        </div>

        {type === "recorrente" && (
          <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="accent-accent"
              />
              Repetição mensal automática (mock)
            </label>
            {recurring && (
              <div>
                <label htmlFor="exp-day" className="mb-1 block text-xs text-muted">
                  Dia do mês para repetir (1–28)
                </label>
                <input
                  id="exp-day"
                  type="number"
                  min={1}
                  max={28}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="w-32 rounded-xl border border-[var(--border)] bg-background px-4 py-2 text-foreground focus-ring"
                />
              </div>
            )}
          </div>
        )}
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-background hover:bg-accent-dim disabled:opacity-50 focus-ring"
        >
          {pending ? "Salvando…" : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-foreground hover:bg-elevated focus-ring"
          >
            Cancelar
          </button>
        ) : (
          <Link
            href="/expenses"
            className="rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-medium text-foreground hover:bg-elevated focus-ring"
          >
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
