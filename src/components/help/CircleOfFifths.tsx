import { useState } from "react";
import { useTranslation } from "react-i18next";

const KEYS = [
  { major: "C", minor: "Am", diminished: "B°" }, { major: "G", minor: "Em", diminished: "F#°" },
  { major: "D", minor: "Bm", diminished: "C#°" }, { major: "A", minor: "F#m", diminished: "G#°" },
  { major: "E", minor: "C#m", diminished: "D#°" }, { major: "B", minor: "G#m", diminished: "A#°" },
  { major: "F#", minor: "D#m", diminished: "E#°" }, { major: "Db", minor: "Bbm", diminished: "C°" },
  { major: "Ab", minor: "Fm", diminished: "G°" }, { major: "Eb", minor: "Cm", diminished: "D°" },
  { major: "Bb", minor: "Gm", diminished: "A°" }, { major: "F", minor: "Dm", diminished: "E°" },
] as const;

export function CircleOfFifths() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const active = KEYS[selected];
  return <div>
    <div className="relative mx-auto aspect-square w-full max-w-xl rounded-full border border-border bg-card shadow-inner">
      <div className="absolute inset-[27%] grid place-items-center rounded-full border border-border bg-background p-3 text-center shadow-lg">
        <div><div className="text-2xl font-bold text-primary sm:text-4xl">{active.major}</div><div className="mt-1 text-sm text-foreground">{active.minor}</div><div className="text-sm text-muted-foreground">{active.diminished}</div></div>
      </div>
      {KEYS.map((key, index) => {
        const angle = index * 30 - 90;
        const x = 50 + 42 * Math.cos(angle * Math.PI / 180);
        const y = 50 + 42 * Math.sin(angle * Math.PI / 180);
        return <button key={key.major} type="button" onClick={() => setSelected(index)} aria-pressed={selected === index} aria-label={t("help.circle.select", key)} style={{ left: `${x}%`, top: `${y}%` }} className={`absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border text-[10px] shadow-sm transition-all sm:h-20 sm:w-20 sm:text-xs ${selected === index ? "z-10 scale-110 border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-foreground hover:border-primary/60"}`}><strong className="text-sm sm:text-base">{key.major}</strong><span>{key.minor}</span><span className={selected === index ? "opacity-80" : "text-muted-foreground"}>{key.diminished}</span></button>;
      })}
    </div>
    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-lg bg-primary/10 p-3"><span className="block text-xs text-muted-foreground">{t("help.circle.major")}</span><strong>{active.major}</strong></div><div className="rounded-lg bg-secondary p-3"><span className="block text-xs text-muted-foreground">{t("help.circle.relativeMinor")}</span><strong>{active.minor}</strong></div><div className="rounded-lg bg-secondary p-3"><span className="block text-xs text-muted-foreground">{t("help.circle.diminished")}</span><strong>{active.diminished}</strong></div></div>
  </div>;
}
