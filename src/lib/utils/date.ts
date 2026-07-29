import { format } from "date-fns";

export function formatDate(dateStr: string | null, fallback = "—"): string {
  if (!dateStr) return fallback;
  try {
    return format(new Date(dateStr), "dd/MM/yyyy");
  } catch {
    return fallback;
  }
}
