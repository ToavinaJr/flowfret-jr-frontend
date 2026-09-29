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

export function formatAdminBytes(value: string, locale: string): string {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return value;
  if (bytes < 1024) return `${bytes.toLocaleString(locale)} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let amount = bytes / 1024;
  let unit = 0;
  while (amount >= 1024 && unit < units.length - 1) {
    amount /= 1024;
    unit += 1;
  }
  return `${amount.toLocaleString(locale, { maximumFractionDigits: 1 })} ${units[unit]}`;
}

export function formatAdminDurationMs(value: number): string {
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export function formatAdminArtists(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "—";
  const names = value.flatMap((artist) => {
    if (typeof artist === "string") return [artist];
    if (artist && typeof artist === "object" && "name" in artist) {
      const name = (artist as { name?: unknown }).name;
      return typeof name === "string" ? [name] : [];
    }
    return [];
  });
  return names.join(", ") || "—";
}
