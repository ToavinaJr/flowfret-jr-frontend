import type { TeachingLessonInput } from '@/services/teachingApi';

export function currentTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function toLocalInputValue(date: Date) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

export function formatLessonDate(value: string, timeZone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

export function lessonInput(
  startsAt: string,
  teachingMode: "IN_PERSON" | "ONLINE",
  location: string,
  meetingUrl: string,
): TeachingLessonInput {
  return {
    startsAt: new Date(startsAt).toISOString(),
    timeZone: currentTimeZone(),
    teachingMode,
    location: teachingMode === "IN_PERSON" ? location : null,
    meetingUrl: teachingMode === "ONLINE" ? meetingUrl : null,
  };
}

export function formatMoney(minorAmount: number, currencyCode: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(minorAmount / 100);
}

export function formatFileSize(
  value: string,
  unknownSizeLabel: string,
  unitLabel: string,
  locale: string,
) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return unknownSizeLabel;
  return (
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
      bytes / (1024 * 1024),
    ) + ` ${unitLabel}`
  );
}
