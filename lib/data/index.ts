/**
 * Camada de dados (mock): estado em `contexts/` + `lib/mocks/storage.ts`.
 * Na integração Supabase: criar `lib/supabase/client.ts` e trocar persistência
 * por tabelas `users`, `expenses`, `categories` mantendo os tipos em `lib/types`.
 */

export type { User, Expense, Category, AiModelId, ExpenseType } from "@/lib/types";
