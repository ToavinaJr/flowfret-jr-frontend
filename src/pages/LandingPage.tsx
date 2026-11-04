import { ArrowRight, ChevronDown, Guitar, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const TOOLS = [
  { key: "chords", href: "/chords" },
  { key: "music", href: "/music" },
  { key: "tuner", href: "/tuner" },
  { key: "rhythm", href: "/metronome" },
] as const;
const STEPS = ["discover", "practice", "progress"] as const;
const FAQS = ["first", "level", "free"] as const;

export default function LandingPage() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background pt-16 text-foreground lg:pt-20">
      <header className="fixed inset-x-0 top-0 z-[60] border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label={t("landing.brand")}>
            <Guitar className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">FlowFret</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label={t("landing.navigation")}>
            <a className="transition-colors hover:text-foreground" href="#features">{t("landing.nav.features")}</a>
            <a className="transition-colors hover:text-foreground" href="#how-it-works">{t("landing.nav.howItWorks")}</a>
            <a className="transition-colors hover:text-foreground" href="#faq">{t("landing.nav.faq")}</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <Link to="/login" className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t("landing.login")}
            </Link>
            <Link to="/register" className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              {t("landing.getStarted")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={t(mobileMenuOpen ? "landing.closeMenu" : "landing.openMenu")}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen ? (
          <div className="border-t border-border px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label={t("landing.navigation")}>
              {([
                ["#features", "landing.nav.features"],
                ["#how-it-works", "landing.nav.howItWorks"],
                ["#faq", "landing.nav.faq"],
              ] as const).map(([href, key]) => (
                <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
                  {t(key)}
                </a>
              ))}
              <div className="mt-2 border-t border-border pt-3">
                <LanguageSwitcher compact />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Link to="/login" className="rounded-md border border-border px-3 py-3 text-center text-sm font-medium">{t("landing.login")}</Link>
                <Link to="/register" className="rounded-md bg-primary px-3 py-3 text-center text-sm font-medium text-primary-foreground">{t("landing.getStarted")}</Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.8fr] lg:gap-20 lg:px-8 lg:py-28">
          <div>
            <p className="mb-5 text-sm font-medium text-muted-foreground">{t("landing.hero.eyebrow")}</p>
            <h1 className="font-display max-w-2xl text-5xl leading-[0.98] text-foreground sm:text-6xl lg:text-7xl">
              {t("landing.hero.title")} <span className="text-primary">{t("landing.hero.titleAccent")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("landing.hero.description")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                {t("landing.hero.primaryCta")}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/chords" className="inline-flex min-h-12 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                {t("landing.hero.secondaryCta")}
              </Link>
            </div>
          </div>

          <ChordPreview
            title={t("landing.hero.chordTitle")}
            position={t("landing.hero.chordPosition")}
            fingering={t("landing.hero.chordFingering")}
            label={t("landing.hero.chordDiagramLabel")}
          />
        </div>
      </section>

      <section id="features" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("landing.features.eyebrow")}</p>
            <h2 className="font-display mt-3 max-w-md text-4xl leading-tight sm:text-5xl">{t("landing.features.title")}</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">{t("landing.features.description")}</p>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {TOOLS.map(({ key, href }) => (
              <li key={key}>
                <Link to={href} className="group flex items-center justify-between gap-6 py-5">
                  <span>
                    <span className="block text-base font-medium text-foreground">{t(`landing.tools.${key}.title`)}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">{t(`landing.tools.${key}.description`)}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-muted-foreground">{t("landing.steps.eyebrow")}</p>
            <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{t("landing.steps.title")}</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{t("landing.steps.description")}</p>
          </div>
          <ol className="mt-10 grid gap-0 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STEPS.map((key) => (
              <li key={key} className="py-5 sm:px-6 sm:py-4 first:sm:pl-0 last:sm:pr-0">
                <h3 className="text-base font-medium">{t(`landing.steps.items.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`landing.steps.items.${key}.description`)}</p>
              </li>
            ))}
          </ol>
          <Link to="/register" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            {t("landing.steps.cta")}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t("landing.faq.eyebrow")}</p>
          <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{t("landing.faq.title")}</h2>
        </div>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {FAQS.map((key) => (
            <details key={key} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium [&::-webkit-details-marker]:hidden">
                {t(`landing.faq.items.${key}.question`)}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 max-w-2xl pr-6 text-sm leading-6 text-muted-foreground">{t(`landing.faq.items.${key}.answer`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">{t("landing.final.title")}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t("landing.final.description")}</p>
          </div>
          <Link to="/register" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            {t("landing.final.cta")}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-foreground"><Guitar className="h-4 w-4 text-primary" aria-hidden="true" />FlowFret</div>
          <p>{t("landing.footer")}</p>
          <div className="flex gap-4"><Link to="/login" className="hover:text-foreground">{t("landing.login")}</Link><Link to="/register" className="hover:text-foreground">{t("landing.getStarted")}</Link></div>
        </div>
      </footer>
    </main>
  );
}

function ChordPreview({
  title,
  position,
  fingering,
  label,
}: {
  title: string;
  position: string;
  fingering: string;
  label: string;
}) {
  return (
    <figure className="mx-auto w-full max-w-md border-y border-border py-6 sm:py-8 lg:ml-auto">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="text-base font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{position}</span>
      </figcaption>
      <svg className="mt-6 h-auto w-full text-foreground" viewBox="0 0 220 190" role="img" aria-label={label}>
        <g fill="none" stroke="currentColor" strokeOpacity="0.42" strokeWidth="1.5">
          {[24, 58, 92, 126, 160, 194].map((x) => <line key={`string-${x}`} x1={x} y1="36" x2={x} y2="156" />)}
          {[36, 66, 96, 126, 156].map((y) => <line key={`fret-${y}`} x1="24" y1={y} x2="194" y2={y} />)}
        </g>
        <line x1="24" y1="36" x2="194" y2="36" stroke="currentColor" strokeWidth="5" />
        <g fill="hsl(var(--primary))">
          <circle cx="58" cy="141" r="8" />
          <circle cx="92" cy="111" r="8" />
          <circle cx="160" cy="81" r="8" />
        </g>
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="126" cy="18" r="6" />
          <circle cx="194" cy="18" r="6" />
        </g>
        <g fill="currentColor" fontFamily="Geist Mono, monospace" fontSize="12" textAnchor="middle">
          <text x="24" y="180">x</text>
          <text x="58" y="180">3</text>
          <text x="92" y="180">2</text>
          <text x="126" y="180">0</text>
          <text x="160" y="180">1</text>
          <text x="194" y="180">0</text>
        </g>
      </svg>
      <p className="mt-3 font-musical text-xs text-muted-foreground">{fingering}</p>
    </figure>
  );
}
