"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { useExpenses } from "@/contexts/ExpensesContext";
import type { Expense } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  expense?: Expense;
};

export function ExpenseFormModal({ open, onClose, mode, expense }: Props) {
  const { user } = useSession();
  const { createExpense, updateExpense } = useExpenses();
  const [createKey, setCreateKey] = useState(0);

  useEffect(() => {
    if (open && mode === "create") {
      setCreateKey((k) => k + 1);
    }
  }, [open, mode]);

  if (!user) return null;

  const title = mode === "create" ? "Nova despesa" : "Editar despesa";

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <p className="mb-6 text-sm text-muted">
        {mode === "create"
          ? "Lance gastos pontuais ou recorrentes. Os dados ficam salvos neste navegador (mock)."
          : "Ajuste os campos e salve para atualizar o lançamento."}
      </p>
      <ExpenseForm
        key={mode === "edit" && expense ? expense.id : `new-${createKey}`}
        initial={mode === "edit" ? expense : undefined}
        submitLabel={mode === "create" ? "Salvar despesa" : "Salvar alterações"}
        onCancel={onClose}
        onSubmit={(data) => {
          if (mode === "create") {
            createExpense(user.id, data);
          } else if (expense) {
            updateExpense(expense.id, user.id, data);
          }
          onClose();
        }}
      />
    </Modal>
  );
}
