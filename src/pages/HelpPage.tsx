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
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold">{t("help.rhythm.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("help.rhythm.description")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary p-4"><h3 className="font-medium">{t("help.rhythm.beatTitle")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("help.rhythm.beatDescription")}</p></div>
          <div className="rounded-lg bg-secondary p-4"><h3 className="font-medium">{t("help.rhythm.meterTitle")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("help.rhythm.meterDescription")}</p></div>
        </div>
        <p className="mt-3 rounded-md border border-border px-3 py-2 text-sm">{t("help.rhythm.examples")}</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6"><h2 className="mb-2 text-lg font-semibold">{t("help.reading.title")}</h2><p className="text-sm text-muted-foreground">{t("help.reading.description")}</p><div className="mt-4 rounded-lg bg-secondary p-4 font-musical text-lg">| C | Am | Dm7 G7 | Cmaj7 |</div><p className="mt-3 text-sm">{t("help.reading.example")}</p></section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold">{t("help.tablature.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("help.tablature.description")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary p-4"><h3 className="font-medium">{t("help.tablature.tabTitle")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("help.tablature.tabDescription")}</p></div>
          <div className="rounded-lg bg-secondary p-4"><h3 className="font-medium">{t("help.tablature.staffTitle")}</h3><p className="mt-1 text-sm text-muted-foreground">{t("help.tablature.staffDescription")}</p></div>
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold">{t("help.triads.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("help.triads.description")}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(["major", "minor", "diminished", "augmented"] as const).map((quality) => (
            <p key={quality} className="rounded-lg bg-secondary p-3 text-sm"><strong>{t(`help.triads.${quality}Title`)}</strong><span className="mt-1 block text-muted-foreground">{t(`help.triads.${quality}Description`)}</span></p>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold">{t("help.intervals.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("help.intervals.description")}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(["unison", "minorSecond", "majorThird", "perfectFifth", "octave"] as const).map((interval) => (
            <div key={interval} className="rounded-lg bg-secondary p-3 text-center"><strong className="block font-musical text-primary">{t(`help.intervals.${interval}Name`)}</strong><span className="mt-1 block text-xs text-muted-foreground">{t(`help.intervals.${interval}Semitones`)}</span></div>
          ))}
        </div>
        <p className="mt-3 text-sm">{t("help.intervals.guitarExample")}</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold">{t("help.scales.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("help.scales.description")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["major", "minor", "harmonicMinor", "pentatonic", "blues", "modes"] as const).map((type) => (
            <div key={type} className="rounded-lg bg-secondary p-4">
              <h3 className="font-medium">{t(`help.scales.${type}Title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`help.scales.${type}Description`)}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-md border border-border px-3 py-2 text-sm">{t("help.scales.rootNote")}</p>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold">{t("help.barres.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("help.barres.description")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["shapes", "technique", "practice"] as const).map((topic) => (
            <div key={topic} className="rounded-lg bg-secondary p-4">
              <h3 className="font-medium">{t(`help.barres.${topic}Title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`help.barres.${topic}Description`)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h2 className="mb-2 text-lg font-semibold">{t("help.ear.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("help.ear.description")}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["absolute", "relative", "harmonic", "musical"] as const).map((type) => (
            <div key={type} className="rounded-lg bg-secondary p-4">
              <h3 className="font-medium">{t(`help.ear.${type}Title`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`help.ear.${type}Description`)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-border p-4">
          <h3 className="font-medium">{t("help.ear.trainingTitle")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("help.ear.trainingDescription")}</p>
        </div>
      </section>
      <section className="rounded-xl border border-border bg-card p-4 sm:p-6"><h2 className="mb-2 text-lg font-semibold">{t("help.circle.title")}</h2><p className="mb-6 text-sm text-muted-foreground">{t("help.circle.description")}</p><CircleOfFifths /></section>
    </div>
  </div>;
}
