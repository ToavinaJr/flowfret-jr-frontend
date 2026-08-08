import { useTranslation } from "react-i18next";
import { CircleOfFifths } from "@/components/help/CircleOfFifths";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";

const NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const CHORD_SYMBOLS = ["C", "Cm", "C7", "Cmaj7", "Cm7", "Cdim", "Caug", "Csus4"];
const ROMAN = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];

export default function HelpPage() {
  const { t } = useTranslation();
  return <div className={`${PAGE_SHELL} max-w-4xl lg:max-w-4xl`}>
    <h1 className={`${PAGE_TITLE} mb-2`}>{t("help.title")}</h1><p className="mb-6 text-sm text-muted-foreground">{t("help.intro")}</p>
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6"><h2 className="mb-2 text-lg font-semibold">{t("help.notes.title")}</h2><p className="text-sm text-muted-foreground">{t("help.notes.description")}</p><div className="mt-4 flex flex-wrap gap-2">{NOTES.map((note, index) => <div key={note} className="rounded-lg bg-secondary px-4 py-3 text-center"><strong className="font-musical">{note}</strong><span className="mt-1 block text-xs text-muted-foreground">{t(`help.notes.names.${index}`)}</span></div>)}</div><p className="mt-4 text-sm">{t("help.notes.accidentals")}</p></section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6"><h2 className="mb-2 text-lg font-semibold">{t("help.chordNotation.title")}</h2><p className="text-sm text-muted-foreground">{t("help.chordNotation.description")}</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{CHORD_SYMBOLS.map((symbol, index) => <div key={symbol} className="flex items-center gap-3 rounded-lg bg-secondary p-3"><strong className="w-16 font-musical text-primary">{symbol}</strong><span className="text-sm">{t(`help.chordNotation.types.${index}`)}</span></div>)}</div></section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6"><h2 className="mb-2 text-lg font-semibold">{t("help.derived.title")}</h2><p className="text-sm text-muted-foreground">{t("help.derived.description")}</p><div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">{ROMAN.map((degree, index) => <div key={degree} className="rounded-lg bg-secondary p-3 text-center"><strong>{degree}</strong><span className="mt-1 block text-xs text-muted-foreground">{t(`help.derived.functions.${index}`)}</span></div>)}</div></section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6"><h2 className="mb-2 text-lg font-semibold">{t("help.reading.title")}</h2><p className="text-sm text-muted-foreground">{t("help.reading.description")}</p><div className="mt-4 rounded-lg bg-secondary p-4 font-musical text-lg">| C | Am | Dm7 G7 | Cmaj7 |</div><p className="mt-3 text-sm">{t("help.reading.example")}</p></section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6"><h2 className="mb-2 text-lg font-semibold">{t("help.circle.title")}</h2><p className="mb-6 text-sm text-muted-foreground">{t("help.circle.description")}</p><CircleOfFifths /></section>
    </div>
  </div>;
}
