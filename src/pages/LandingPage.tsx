import { ArrowRight, ChevronDown, Guitar, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FEATURE_TILES = [
  {
    key: "song",
    className: "xl:col-span-7",
    art: "waveform",
    items: [
      ["music", "/music"],
      ["practiceLoop", "/music"],
      ["vocalRemoval", "/music"],
    ],
  },
  {
    key: "arrangement",
    className: "xl:col-span-5",
    art: "fretboard",
    items: [
      ["upload", "/upload"],
      ["chords", "/chords"],
    ],
  },
  {
    key: "instruments",
    className: "xl:col-span-5",
    art: "strings",
    items: [
      ["tuner", "/tuner"],
      ["rhythm", "/metronome"],
      ["scales", "/scales"],
    ],
  },
  {
    key: "library",
    className: "xl:col-span-7",
    art: "library",
    items: [
      ["playlists", "/playlists"],
      ["transcriptions", "/transcriptions"],
      ["settings", "/parametres"],
      ["help", "/help"],
    ],
  },
  {
    key: "community",
    className: "xl:col-span-12",
    art: "community",
    items: [
      ["globalSearch", "/search"],
      ["feed", "/register"],
      ["friends", "/friends"],
      ["messages", "/messages"],
      ["teaching", "/teaching"],
      ["notifications", "/notifications"],
      ["profiles", "/profile"],
    ],
  },
] as const;
const STEPS = ["discover", "practice", "progress"] as const;
const FAQS = ["about", "starting", "availability"] as const;

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

      <section>
        <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:gap-20 lg:px-8 lg:py-24">
          <div>
            <h1 className="font-display max-w-2xl text-balance text-4xl leading-[1.02] text-foreground sm:text-5xl lg:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              {t("landing.hero.description")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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

      <section id="features" className="scroll-mt-20 bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-20">
            <div>
              <h2 className="font-display max-w-md text-balance text-4xl leading-tight sm:text-5xl">{t("landing.features.title")}</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">{t("landing.features.description")}</p>
          </div>
          <div className="grid gap-4 border-t border-border pt-8 md:grid-cols-2 xl:grid-cols-12">
            {FEATURE_TILES.map(({ key, className, art, items }) => (
              <article key={key} aria-labelledby={`landing-feature-${key}`} className={`relative isolate overflow-hidden rounded-2xl border border-border bg-background p-5 sm:p-6 ${className}`}>
                <FeatureIllustration kind={art} />
                <div className="relative">
                  <p className="text-xs font-medium text-primary">{t(`landing.features.tiles.${key}.kicker`)}</p>
                  <h3 id={`landing-feature-${key}`} className="mt-2 max-w-xl text-xl font-semibold tracking-tight sm:text-2xl">{t(`landing.features.tiles.${key}.title`)}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t(`landing.features.tiles.${key}.description`)}</p>
                  <ul className={`mt-5 grid gap-x-6 gap-y-1 border-t border-border/80 pt-3 ${key === "community" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"}`}>
                    {items.map(([itemKey, href]) => (
                      <li key={itemKey}>
                        <Link to={href} className="group block rounded-md py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <span className="block font-medium text-foreground group-hover:underline group-hover:decoration-primary group-hover:underline-offset-4">{t(`landing.features.items.${itemKey}.title`)}</span>
                          <span className="mt-1 block text-sm leading-5 text-muted-foreground">{t(`landing.features.items.${itemKey}.description`)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl border-t border-border pt-5 text-sm leading-6 text-muted-foreground">{t("landing.features.availabilityNote")}</p>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-y border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-xl">
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl">{t("landing.steps.title")}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{t("landing.steps.description")}</p>
          </div>
          <ol className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((key) => (
              <li key={key} className="border-l-2 border-primary pl-4 sm:pl-5">
                <h3 className="text-lg font-medium">{t(`landing.steps.items.${key}.title`)}</h3>
                <p className="mt-2 text-base leading-7 text-muted-foreground">{t(`landing.steps.items.${key}.description`)}</p>
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
          <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl">{t("landing.faq.title")}</h2>
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
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="font-display text-balance text-4xl leading-tight sm:text-5xl">{t("landing.final.title")}</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">{t("landing.final.description")}</p>
          </div>
          <Link to="/register" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            {t("landing.final.cta")}<ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-foreground"><Guitar className="h-4 w-4 text-primary" aria-hidden="true" />FlowFret</div>
          <p>{t("landing.footer")}</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label={t("landing.footerNavigation")}>
            <a href="#features" className="hover:text-foreground">{t("landing.footerLinks.features")}</a>
            <a href="#faq" className="hover:text-foreground">{t("landing.footerLinks.faq")}</a>
            <Link to="/login" className="hover:text-foreground">{t("landing.login")}</Link>
            <Link to="/register" className="hover:text-foreground">{t("landing.getStarted")}</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function FeatureIllustration({ kind }: { kind: string }) {
  const common = "pointer-events-none absolute right-3 top-3 h-24 w-36 text-primary/15 sm:h-28 sm:w-44";
  if (kind === "waveform") return <svg aria-hidden="true" focusable="false" viewBox="0 0 180 100" className={common}><path d="M8 50h14l8-20 12 42 12-56 13 68 13-49 12 28 12-18 12 9 12-26 12 43 12-21h21" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 82h164" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6"/></svg>;
  if (kind === "fretboard") return <svg aria-hidden="true" focusable="false" viewBox="0 0 180 100" className={common}><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 16v68M48 16v68M76 16v68M104 16v68M132 16v68M160 16v68M20 20h140M20 40h140M20 60h140M20 80h140"/></g><g fill="currentColor"><circle cx="48" cy="30" r="5"/><circle cx="104" cy="50" r="5"/><circle cx="132" cy="70" r="5"/></g></svg>;
  if (kind === "strings") return <svg aria-hidden="true" focusable="false" viewBox="0 0 180 100" className={common}><path d="M18 20h144M18 32h144M18 44h144M18 56h144M18 68h144M18 80h144" stroke="currentColor" strokeWidth="1.5"/><path d="M42 10v80M70 10v80M98 10v80M126 10v80" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5"/><circle cx="98" cy="44" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M98 44l18-14" stroke="currentColor" strokeWidth="2"/></svg>;
  if (kind === "library") return <svg aria-hidden="true" focusable="false" viewBox="0 0 180 100" className={common}><rect x="34" y="12" width="104" height="72" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M48 30h72M48 44h52M48 58h62M48 72h42" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M138 22h14v62h-14" fill="none" stroke="currentColor" strokeWidth="2"/></svg>;
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 180 100" className={common}><circle cx="90" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="44" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="136" cy="28" r="8" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="44" cy="72" r="8" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="136" cy="72" r="8" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M52 32l27 14M128 32l-27 14M52 68l27-14M128 68l-27-14" stroke="currentColor" strokeWidth="2"/></svg>;
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
    <figure className="mx-auto w-full max-w-lg rounded-xl border border-border bg-card px-5 py-6 sm:px-8 sm:py-8 lg:ml-auto">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="text-base font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{position}</span>
      </figcaption>
      <svg className="mx-auto mt-6 h-auto w-full max-w-sm text-foreground" viewBox="0 0 220 190" role="img" aria-label={label}>
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
