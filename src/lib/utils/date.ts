export function formatDate(dateStr: string | null, fallback?: string): string {
  try {
    const d = new Date(dateStr ?? "");
    if (!dateStr || isNaN(d.getTime())) return fallback ?? dateStr ?? "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return fallback ?? dateStr ?? "";
  }
}
