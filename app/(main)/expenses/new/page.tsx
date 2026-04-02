import { redirect } from "next/navigation";

/** Mantido para links antigos: novo lançamento é feito por modal em /dashboard e /expenses. */
export default function NewExpenseRedirectPage() {
  redirect("/expenses");
}
