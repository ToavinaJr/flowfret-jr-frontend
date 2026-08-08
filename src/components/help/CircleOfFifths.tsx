import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

const ENGLISH_MAJOR = ["C", "G", "D", "A", "E", "B", "F♯", "D♭", "A♭", "E♭", "B♭", "F"];
const ENGLISH_MINOR = ["Am", "Em", "Bm", "F♯m", "C♯m", "G♯m", "D♯m", "B♭m", "Fm", "Cm", "Gm", "Dm"];
const FRENCH_MAJOR = ["Do", "Sol", "Ré", "La", "Mi", "Si", "Fa♯", "Ré♭", "La♭", "Mi♭", "Si♭", "Fa"];
const FRENCH_MINOR = ["Lam", "Mim", "Sim", "Fa♯m", "Do♯m", "Sol♯m", "Ré♯m", "Si♭m", "Fam", "Dom", "Solm", "Rém"];
const CENTER = 250;

function point(radius: number, degrees: number) {
  const angle = ((degrees - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
}

function sectorPath(inner: number, outer: number, start: number, end: number) {
  const a = point(outer, start), b = point(outer, end), c = point(inner, end), d = point(inner, start);
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 0 0 ${d.x} ${d.y} Z`;
}

const wrap = (index: number) => (index + 12) % 12;

export function CircleOfFifths() {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState(0);
  const isFrench = i18n.resolvedLanguage?.startsWith("fr") ?? false;
  const major = isFrench ? FRENCH_MAJOR : ENGLISH_MAJOR;
  const minor = isFrench ? FRENCH_MINOR : ENGLISH_MINOR;
  const left = wrap(selected - 1);
  const right = wrap(selected + 1);
  const diminished = wrap(selected + 5);
  const majorDegrees = new Map([[left, "IV"], [selected, "I"], [right, "V"]]);
  const minorDegrees = new Map([[left, "ii"], [selected, "vi"], [right, "iii"]]);

  const chooseWithKeyboard = (event: KeyboardEvent<SVGGElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelected(index);
    }
  };

  return <div>
    <svg viewBox="0 0 500 500" className="mx-auto aspect-square w-full max-w-xl drop-shadow-lg" aria-label={t("help.circle.title")}>
      <circle cx={CENTER} cy={CENTER} r="234" fill="hsl(205 78% 18%)" />
      {major.map((note, index) => {
        const start = index * 30 - 15;
        const labelPoint = point(197, index * 30);
        const degree = majorDegrees.get(index);
        const isDiminished = index === diminished;
        const label = isDiminished ? `${note}°` : note;
        const fill = isDiminished ? "hsl(36 100% 50%)" : degree ? "hsl(212 88% 58%)" : "hsl(205 78% 18%)";
        return <g key={note} role="button" tabIndex={0} onClick={() => setSelected(index)} onKeyDown={(event) => chooseWithKeyboard(event, index)} aria-label={t("circleHarmony.selectKey", { key: note })} className="cursor-pointer outline-none">
          <path d={sectorPath(162, 232, start, start + 30)} fill={fill} stroke="white" strokeWidth={index === selected ? 4 : 2.5} className="transition-[fill,filter] hover:brightness-110 focus:brightness-110" />
          <text x={labelPoint.x} y={labelPoint.y - (degree || isDiminished ? 8 : 0)} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="20" fontWeight={degree || isDiminished ? 700 : 500} className="pointer-events-none select-none">{label}</text>
          {(degree || isDiminished) && <text x={labelPoint.x} y={labelPoint.y + 18} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="700" className="pointer-events-none select-none">{isDiminished ? "vii°" : degree}</text>}
        </g>;
      })}
      {minor.map((note, index) => {
        const start = index * 30 - 15;
        const labelPoint = point(127, index * 30);
        const degree = minorDegrees.get(index);
        return <g key={note} role="button" tabIndex={0} onClick={() => setSelected(index)} onKeyDown={(event) => chooseWithKeyboard(event, index)} aria-label={t("circleHarmony.selectKey", { key: major[index] })} className="cursor-pointer outline-none">
          <path d={sectorPath(92, 162, start, start + 30)} fill={degree ? "hsl(105 58% 48%)" : "hsl(205 78% 18%)"} stroke="white" strokeWidth="2.5" className="transition-[fill,filter] hover:brightness-110 focus:brightness-110" />
          <text x={labelPoint.x} y={labelPoint.y - (degree ? 7 : 0)} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="15" fontWeight={degree ? 700 : 500} className="pointer-events-none select-none">{note}</text>
          {degree && <text x={labelPoint.x} y={labelPoint.y + 15} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="12" fontWeight="700" className="pointer-events-none select-none">{degree}</text>}
        </g>;
      })}
      <circle cx={CENTER} cy={CENTER} r="90" fill="hsl(var(--background))" stroke="white" strokeWidth="3" />
      <text x={CENTER} y={242} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="25" fontWeight="700">{major[selected]}</text>
      <text x={CENTER} y={270} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">{t("circleHarmony.selectedKey")}</text>
    </svg>
    <div className="mt-5 flex flex-wrap justify-center gap-5 text-sm">
      <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-sm bg-blue-500" />{t("circleHarmony.major")}</span>
      <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-sm bg-green-500" />{t("circleHarmony.minor")}</span>
      <span className="flex items-center gap-2"><i className="h-4 w-4 rounded-sm bg-orange-500" />{t("circleHarmony.diminished")}</span>
    </div>
    <div className="mt-5 rounded-lg bg-secondary p-4 text-center text-sm">
      <span className="block text-xs text-muted-foreground">{t("circleHarmony.harmony", { key: major[selected] })}</span>
      <strong className="mt-1 block font-musical">{major[selected]} · {minor[left]} · {minor[right]} · {major[left]} · {major[right]} · {minor[selected]} · {major[diminished]}°</strong>
      <span className="mt-1 block text-xs text-muted-foreground">I · ii · iii · IV · V · vi · vii°</span>
    </div>
  </div>;
}
