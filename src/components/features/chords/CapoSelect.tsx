import { useTranslation } from "react-i18next";
import { useCapo } from "@/contexts/CapoContext";

export function CapoSelect({ namespace }: { namespace: "chords" | "chordPlayer" }) {
  const { t } = useTranslation();
  const { capo, setCapo } = useCapo();
  const labelId = `${namespace}-capo-label`;
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 text-sm" htmlFor={`${namespace}-capo`}>
      <span id={labelId} className="text-muted-foreground">{t(`${namespace}.capo`)}</span>
      <select
        id={`${namespace}-capo`}
        aria-labelledby={labelId}
        value={capo}
        onChange={(event) => setCapo(Number(event.target.value))}
        className="min-h-11 rounded-md border border-border bg-background px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value={0}>{t(`${namespace}.noCapo`)}</option>
        {Array.from({ length: 12 }, (_, index) => index + 1).map((fret) => (
          <option key={fret} value={fret}>{t(`${namespace}.capoFret`, { fret })}</option>
        ))}
      </select>
    </label>
  );
}
