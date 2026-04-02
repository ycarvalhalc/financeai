export type ExpenseType = "pontual" | "recorrente";

export type RecurringConfig = {
  active: boolean;
  dayOfMonth?: number;
};

export type Expense = {
  id: string;
  userId: string;
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  type: ExpenseType;
  recurring?: RecurringConfig;
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export const AI_MODEL_IDS = [
  "gpt-4",
  "claude-3-opus",
  "gemini-pro",
  "llama-3",
] as const;

export type AiModelId = (typeof AI_MODEL_IDS)[number];

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  preferredAiModel: AiModelId;
};
