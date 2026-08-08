import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

const KEYS = [
  { major: "C", minor: "Am", diminished: "B°" }, { major: "G", minor: "Em", diminished: "F#°" },
  { major: "D", minor: "Bm", diminished: "C#°" }, { major: "A", minor: "F#m", diminished: "G#°" },
  { major: "E", minor: "C#m", diminished: "D#°" }, { major: "B", minor: "G#m", diminished: "A#°" },
  { major: "F#", minor: "D#m", diminished: "E#°" }, { major: "Db", minor: "Bbm", diminished: "C°" },
  { major: "Ab", minor: "Fm", diminished: "G°" }, { major: "Eb", minor: "Cm", diminished: "D°" },
  { major: "Bb", minor: "Gm", diminished: "A°" }, { major: "F", minor: "Dm", diminished: "E°" },
] as const;

type Ring = "major" | "minor" | "diminished";
const CENTER = 250;
function point(radius: number, degrees: number) { const angle = (degrees - 90) * Math.PI / 180; return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) }; }
function sectorPath(inner: number, outer: number, start: number, end: number) {
  const a = point(outer, start), b = point(outer, end), c = point(inner, end), d = point(inner, start);
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 0 0 ${d.x} ${d.y} Z`;
}

export function CircleOfFifths() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const [ring, setRing] = useState<Ring>("major");
  const active = KEYS[selected];
  const choose = (index: number, nextRing: Ring) => { setSelected(index); setRing(nextRing); };
  const keyboardChoose = (event: KeyboardEvent<SVGGElement>, index: number, nextRing: Ring) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(index, nextRing); } };
  const rings = [
    { id: "major" as const, inner: 162, outer: 232, color: "hsl(212 88% 58%)" },
    { id: "minor" as const, inner: 104, outer: 162, color: "hsl(105 58% 48%)" },
    { id: "diminished" as const, inner: 62, outer: 104, color: "hsl(36 100% 50%)" },
  ];

  return <div>
    <svg viewBox="0 0 500 500" className="mx-auto aspect-square w-full max-w-2xl drop-shadow-lg" aria-label={t("help.circle.title")}>
      <circle cx={CENTER} cy={CENTER} r="234" fill="hsl(205 78% 18%)" />
      {rings.flatMap((definition) => KEYS.map((key, index) => {
        const start = index * 30 - 15, end = start + 30;
        const midpoint = index * 30;
        const labelPoint = point((definition.inner + definition.outer) / 2, midpoint);
        const isActive = selected === index && ring === definition.id;
        const label = definition.id === "major" ? key.major : definition.id === "minor" ? key.minor : key.diminished;
        return <g key={`${definition.id}-${key.major}`} role="button" tabIndex={0} onClick={() => choose(index, definition.id)} onKeyDown={(event) => keyboardChoose(event, index, definition.id)} aria-label={t("help.circle.select", key)} className="cursor-pointer outline-none">
          <path d={sectorPath(definition.inner, definition.outer, start, end)} fill={isActive ? definition.color : "hsl(205 78% 18%)"} stroke="white" strokeWidth={isActive ? 4 : 2.5} className="transition-colors hover:fill-[hsl(205_70%_26%)] focus:fill-[hsl(205_70%_26%)]" />
          <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={definition.id === "major" ? 20 : definition.id === "minor" ? 15 : 12} fontWeight={isActive ? 700 : 500} className="pointer-events-none select-none">{label}</text>
        </g>;
      }))}
      <circle cx={CENTER} cy={CENTER} r="60" fill="hsl(var(--background))" stroke="white" strokeWidth="3" />
      <text x={CENTER} y={239} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="22" fontWeight="700">{ring === "major" ? active.major : ring === "minor" ? active.minor : active.diminished}</text>
      <text x={CENTER} y={266} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">{t(ring === "minor" ? "help.circle.relativeMinor" : `help.circle.${ring}`)}</text>
    </svg>
    <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm"><span className="flex items-center gap-2"><i className="h-4 w-4 rounded-sm bg-blue-500" />{t("help.circle.major")}</span><span className="flex items-center gap-2"><i className="h-4 w-4 rounded-sm bg-green-500" />{t("help.circle.relativeMinor")}</span><span className="flex items-center gap-2"><i className="h-4 w-4 rounded-sm bg-orange-500" />{t("help.circle.diminished")}</span></div>
    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-lg bg-blue-500/10 p-3"><span className="block text-xs text-muted-foreground">{t("help.circle.major")}</span><strong>{active.major}</strong></div><div className="rounded-lg bg-green-500/10 p-3"><span className="block text-xs text-muted-foreground">{t("help.circle.relativeMinor")}</span><strong>{active.minor}</strong></div><div className="rounded-lg bg-orange-500/10 p-3"><span className="block text-xs text-muted-foreground">{t("help.circle.diminished")}</span><strong>{active.diminished}</strong></div></div>
  </div>;
}
