import { Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/usePlayback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DURATIONS = [5, 10, 15, 30, 45, 60];

export function SleepTimerControl({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const { t } = useTranslation();
  const { sleepTimer, setSleepTimer } = usePlayback();
  const value = sleepTimer?.kind === "track"
    ? "track"
    : sleepTimer?.kind === "timer"
      ? String(sleepTimer.minutes)
      : "off";

  return (
    <Select
      value={value}
      onValueChange={(selected) => {
        setSleepTimer(selected === "off" ? null : selected === "track" ? "track" : Number(selected));
      }}
    >
      <SelectTrigger
        aria-label={t("mediaPlayer.sleepTimer")}
        title={t("mediaPlayer.sleepTimer")}
        className={`h-9 shrink-0 gap-1 rounded-md border-0 px-2 shadow-none focus:ring-0 ${compact ? "w-[108px]" : "w-[140px]"} ${sleepTimer ? "bg-primary/15 text-primary hover:bg-primary/20" : "bg-transparent text-muted-foreground hover:bg-secondary"} ${className}`}
      >
        <Moon aria-hidden="true" className="h-4 w-4 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[13rem] rounded-xl border-border p-1.5 shadow-lg">
        <SelectItem value="off" className="rounded-md">{t("mediaPlayer.sleepTimerOff")}</SelectItem>
        <SelectItem value="track" className="rounded-md">{t("mediaPlayer.sleepTimerEndOfTrack")}</SelectItem>
        {DURATIONS.map((minutes) => (
          <SelectItem key={minutes} value={String(minutes)} className="rounded-md">
            {t("mediaPlayer.sleepTimerMinutes", { count: minutes })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
