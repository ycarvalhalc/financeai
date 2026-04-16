"use client";

import { useMemo, useState } from "react";
import { format, isSameMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "@/contexts/SessionContext";
import { useExpenses } from "@/contexts/ExpensesContext";
import type { Expense } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function ExpensesPage() {
  const { user } = useSession();
  const { listForUser, deleteExpense, cancelRecurring, hydrated, categories } = useExpenses();
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [categoryId, setCategoryId] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [recurringTarget, setRecurringTarget] = useState<Expense | null>(null);

  const all = useMemo(() => (user ? listForUser(user.id) : []), [user, listForUser]);

  const filtered = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const anchor = new Date(y, m - 1, 1);
    return all.filter((e) => {
      const d = parseISO(e.date + "T12:00:00");
      if (!isSameMonth(d, anchor)) return false;
      if (categoryId && e.categoryId !== categoryId) return false;
      return true;
    });
  }, [all, month, categoryId]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [filtered],
  );

  if (!hydrated || !user) return null;

  return (
    <div className="space-y-8 animate-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-foreground">Histórico de despesas</h1>
          <p className="mt-1 text-sm text-muted">Filtre por mês e categoria. Edite, exclua ou cancele recorrências.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background hover:bg-accent-dim focus-ring"
        >
          Novo gasto
        </button>
      </div>

      <div className="flex flex-wrap gap-4 rounded-2xl border border-[var(--border)] bg-elevated/40 p-4">
        <div>
          <label htmlFor="filter-month" className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Mês
          </label>
          <input
            id="filter-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-background px-3 py-2 text-foreground focus-ring"
          />
        </div>
        <div>
          <label htmlFor="filter-cat" className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Categoria
          </label>
          <select
            id="filter-cat"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="min-w-[180px] rounded-xl border border-[var(--border)] bg-background px-3 py-2 text-foreground focus-ring"
          >
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-elevated/30">
        {sorted.length === 0 ? (
          <p className="p-10 text-center text-muted">Nenhuma despesa neste filtro.</p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {sorted.map((e) => {
              const cat = categories.find((c) => c.id === e.categoryId);
              return (
                <li
                  key={e.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-muted">
                      {format(parseISO(e.date + "T12:00:00"), "d 'de' MMMM yyyy", { locale: ptBR })} ·{" "}
                      <span style={{ color: cat?.color }}>{cat?.name}</span> ·{" "}
                      {e.type === "recorrente" ? "Recorrente" : "Pontual"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-lg text-foreground">{formatBRL(e.amount)}</span>
                    <button
                      type="button"
                      onClick={() => setEditing(e)}
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:bg-background focus-ring"
                    >
                      Editar
                    </button>
                    {e.type === "recorrente" && e.recurring?.active && (
                      <button
                        type="button"
                        onClick={() => setRecurringTarget(e)}
                        className="rounded-lg border border-accent/40 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 focus-ring"
                      >
                        Cancelar recorrência
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(e)}
                      className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 focus-ring"
                    >
                      Excluir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ExpenseFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
      />

      <ExpenseFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        mode="edit"
        expense={editing ?? undefined}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir despesa?"
        message={
          deleteTarget
            ? `Tem certeza que deseja excluir "${deleteTarget.title}" (${formatBRL(deleteTarget.amount)})? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        cancelLabel="Voltar"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deleteExpense(deleteTarget.id, user.id);
        }}
      />

      <ConfirmModal
        open={!!recurringTarget}
        onClose={() => setRecurringTarget(null)}
        title="Desativar repetição?"
        message={
          recurringTarget
            ? `A despesa "${recurringTarget.title}" continuará no histórico, mas não será mais repetida automaticamente todo mês.`
            : ""
        }
        confirmLabel="Desativar repetição"
        cancelLabel="Voltar"
        variant="neutral"
        onConfirm={async () => {
          if (recurringTarget) await cancelRecurring(recurringTarget.id, user.id);
        }}
      />
    </div>
  );
}
