export function formatRelative(
  iso: string,
  translate: (key: string) => string,
): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 60)
    return translate("feed.relativeMinutes").replace(
      "{{count}}",
      String(Math.max(1, minutes)),
    );
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return translate("feed.relativeHours").replace("{{count}}", String(hours));
  return translate("feed.relativeDays").replace(
    "{{count}}",
    String(Math.floor(hours / 24)),
  );
}
