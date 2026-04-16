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
  const { createExpense, updateExpense, categories } = useExpenses();
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
          ? "Lance gastos pontuais ou recorrentes. Os dados são salvos na sua conta."
          : "Ajuste os campos e salve para atualizar o lançamento."}
      </p>
      <ExpenseForm
        categories={categories}
        key={mode === "edit" && expense ? expense.id : `new-${createKey}`}
        initial={mode === "edit" ? expense : undefined}
        submitLabel={mode === "create" ? "Salvar despesa" : "Salvar alterações"}
        onCancel={onClose}
        onSubmit={async (data) => {
          try {
            if (mode === "create") {
              await createExpense(user.id, data);
            } else if (expense) {
              await updateExpense(expense.id, user.id, data);
            }
            onClose();
          } catch (e) {
            console.error(e);
          }
        }}
      />
    </Modal>
  );
}
