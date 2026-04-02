/** Chaves do localStorage — troque por queries Supabase na fase 2. */
export const STORAGE_KEYS = {
  users: "financy_users",
  sessionUserId: "financy_session_user_id",
  expenses: "financy_expenses",
} as const;

export const AI_MODEL_LABELS: Record<string, string> = {
  "gpt-4": "GPT-4",
  "claude-3-opus": "Claude 3 Opus",
  "gemini-pro": "Gemini Pro",
  "llama-3": "Llama 3",
};
