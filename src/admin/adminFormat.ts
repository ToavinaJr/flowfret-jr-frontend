export function formatAdminDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function truncateAdminText(value: string | null, length = 80): string {
  if (!value) return "—";
  return value.length > length ? `${value.slice(0, length)}…` : value;
}
