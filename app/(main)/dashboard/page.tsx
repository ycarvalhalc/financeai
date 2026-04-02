"use client";

import { useMemo, useState } from "react";
import { isSameMonth, parseISO } from "date-fns";
import { useSession } from "@/contexts/SessionContext";
import { useExpenses } from "@/contexts/ExpensesContext";
import { ExpenseCharts } from "@/components/dashboard/ExpenseCharts";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { AiInsightsModal } from "@/components/dashboard/AiInsightsModal";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { formatBRL } from "@/lib/format";

export default function DashboardPage() {
  const { user } = useSession();
  const { listForUser, hydrated } = useExpenses();
  const [aiOpen, setAiOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const all = useMemo(() => (user ? listForUser(user.id) : []), [user, listForUser]);

  const monthExpenses = useMemo(() => {
    const now = new Date();
    return all.filter((e) => isSameMonth(parseISO(e.date), now));
  }, [all]);

  const recentFive = useMemo(() => {
    return [...all].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [all]);

  const monthTotal = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses]);

  if (!hydrated || !user) return null;

  return (
    <div className="space-y-10">
      <header className="animate-in-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Olá,</p>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">{user.name}</h1>
          <p className="mt-1 text-muted">Resumo financeiro e insights para economizar.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-xl border border-[var(--border)] bg-elevated px-5 py-3 text-sm font-semibold text-foreground transition hover:border-accent/50 hover:text-accent focus-ring"
          >
            Novo gasto
          </button>
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="rounded-xl bg-accent px-6 py-3 text-sm font-bold text-background shadow-lg shadow-accent/20 transition hover:bg-accent-dim focus-ring"
          >
            Central de IA
          </button>
        </div>
      </header>

      <section className="animate-in-up animate-delay-1 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-elevated/60 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Total no mês</p>
          <p className="font-display mt-2 text-3xl text-accent">{formatBRL(monthTotal)}</p>
          <p className="mt-1 text-xs text-muted">Soma das despesas com data no mês corrente</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-elevated/60 p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Lançamentos no mês</p>
          <p className="font-display mt-2 text-3xl text-foreground">{monthExpenses.length}</p>
          <p className="mt-1 text-xs text-muted">Inclui pontuais e recorrentes lançadas neste período</p>
        </div>
      </section>

      <ExpenseCharts expenses={monthExpenses} />
      <RecentExpenses items={recentFive} onNewExpense={() => setCreateOpen(true)} />

      <AiInsightsModal open={aiOpen} onClose={() => setAiOpen(false)} expenses={monthExpenses} />

      <ExpenseFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
      />
    </div>
  );
}
