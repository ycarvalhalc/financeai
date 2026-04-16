"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Category, Expense } from "@/lib/types";
import { formatBRL } from "@/lib/format";

type Row = { name: string; value: number; color: string };

function aggregateByCategory(expenses: Expense[], categories: Category[]): Row[] {
  const map = new Map<string, { value: number; color: string }>();
  for (const e of expenses) {
    const cat = categories.find((c) => c.id === e.categoryId);
    const name = cat?.name ?? "Outros";
    const color = cat?.color ?? "#adb5bd";
    const prev = map.get(name) ?? { value: 0, color };
    map.set(name, { value: prev.value + e.amount, color });
  }
  return Array.from(map.entries()).map(([name, v]) => ({
    name,
    value: v.value,
    color: v.color,
  }));
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const v = p.value ?? 0;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-elevated px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-foreground">{p.name}</p>
      <p className="text-accent">{formatBRL(v)}</p>
    </div>
  );
}

export function ExpenseCharts({
  expenses,
  categories,
}: {
  expenses: Expense[];
  categories: Category[];
}) {
  const data = useMemo(() => aggregateByCategory(expenses, categories), [expenses, categories]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-elevated/50 p-12 text-center text-muted">
        Nenhuma despesa neste mês para exibir nos gráficos.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="animate-in-up animate-delay-1 rounded-2xl border border-[var(--border)] bg-elevated/40 p-4 sm:p-6">
        <h3 className="font-display text-lg text-foreground">Distribuição (pizza)</h3>
        <p className="mb-4 text-xs text-muted">Por categoria no mês atual</p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={96}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="animate-in-up animate-delay-2 rounded-2xl border border-[var(--border)] bg-elevated/40 p-4 sm:p-6">
        <h3 className="font-display text-lg text-foreground">Totais (barras)</h3>
        <p className="mb-4 text-xs text-muted">Valores por categoria</p>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232,228,220,0.08)" />
              <XAxis type="number" tickFormatter={(v) => `R$${v}`} stroke="var(--foreground-muted)" fontSize={11} />
              <YAxis type="category" dataKey="name" width={88} stroke="var(--foreground-muted)" fontSize={11} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
