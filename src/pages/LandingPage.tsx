import {
  ArrowRight,
  Check,
  ChevronDown,
  CirclePlay,
  Guitar,
  Headphones,
  Menu,
  Music2,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const FEATURES = [
  { key: "practice", icon: Target },
  { key: "music", icon: Headphones },
  { key: "community", icon: Users },
] as const;

const STEPS = ["discover", "practice", "progress"] as const;

const FAQS = ["first", "level", "free"] as const;

export default function LandingPage() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label={t("landing.brand") }>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Guitar className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">FlowFret</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex" aria-label={t("landing.navigation") }>
            <a className="transition-colors hover:text-foreground" href="#features">{t("landing.nav.features")}</a>
            <a className="transition-colors hover:text-foreground" href="#how-it-works">{t("landing.nav.howItWorks")}</a>
            <a className="transition-colors hover:text-foreground" href="#faq">{t("landing.nav.faq")}</a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher />
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {t("landing.login")}
            </Link>
            <Link to="/register" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">
              {t("landing.getStarted")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={t(mobileMenuOpen ? "landing.closeMenu" : "landing.openMenu")}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen ? (
          <div className="border-t border-border/70 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label={t("landing.navigation") }>
              {([
                ["#features", "landing.nav.features"],
                ["#how-it-works", "landing.nav.howItWorks"],
                ["#faq", "landing.nav.faq"],
              ] as const).map(([href, key]) => (
                <a key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
                  {t(key)}
                </a>
              ))}
              <div className="mt-2 border-t border-border pt-3">
                <LanguageSwitcher compact />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                <Link to="/login" className="rounded-lg border border-border px-3 py-3 text-center text-sm font-medium">{t("landing.login")}</Link>
                <Link to="/register" className="rounded-lg bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground">{t("landing.getStarted")}</Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <section className="relative isolate overflow-hidden">
        <div className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -right-32 top-40 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-28 lg:pt-28">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t("landing.hero.eyebrow")}
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              {t("landing.hero.title")} <span className="text-primary">{t("landing.hero.titleAccent")}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {t("landing.hero.description")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-transform hover:-translate-y-0.5">
                {t("landing.hero.primaryCta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
                <CirclePlay className="h-4 w-4 text-primary" />
                {t("landing.hero.secondaryCta")}
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {(["noCard", "allLevels", "yourPace"] as const).map((key) => (
                <span key={key} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" />{t(`landing.hero.${key}`)}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-3 shadow-2xl shadow-primary/10 sm:p-4">
              <div className="rounded-[1.1rem] bg-[#17151b] p-4 text-white sm:p-5">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-white/50">
                  <span>FlowFret</span><span>{t("landing.mockup.session")}</span>
                </div>
                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-white/50">{t("landing.mockup.nowPlaying")}</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight">{t("landing.mockup.song")}</p>
                    <p className="mt-1 text-sm text-white/55">{t("landing.mockup.artist")}</p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
                    <Music2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-7 flex items-end justify-center gap-1.5" aria-hidden="true">
                  {[24, 38, 30, 56, 44, 72, 48, 84, 58, 36, 64, 42, 76, 50, 30, 62].map((height, index) => (
                    <span key={index} className="w-1.5 rounded-full bg-primary/80" style={{ height }} />
                  ))}
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[42%] rounded-full bg-primary" /></div>
                <div className="mt-2 flex justify-between text-[10px] text-white/45"><span>01:42</span><span>04:08</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-2 pt-3 sm:p-3 sm:pt-4">
                {(["chord", "scale", "rhythm"] as const).map((key, index) => (
                  <div key={key} className="rounded-xl border border-border bg-secondary/70 p-2.5 sm:p-3">
                    <div className="mb-2 h-1.5 w-8 rounded-full bg-primary/70" />
                    <p className="text-[11px] font-semibold text-foreground">{t(`landing.mockup.${key}`)}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{t(`landing.mockup.level${index + 1}`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 sm:py-10 lg:px-8">
          {(["practice", "clarity", "momentum"] as const).map((key) => (
            <div key={key} className="flex gap-3 sm:block sm:text-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mx-auto"><Check className="h-4 w-4" /></div>
              <div className="mt-0.5 sm:mt-3"><p className="text-sm font-semibold">{t(`landing.proof.${key}.title`)}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{t(`landing.proof.${key}.description`)}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="scroll-mt-20 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{t("landing.features.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("landing.features.title")}</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{t("landing.features.description")}</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-6">
          {FEATURES.map(({ key, icon: Icon }) => (
            <article key={key} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-1 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-6 text-lg font-semibold">{t(`landing.features.items.${key}.title`)}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(`landing.features.items.${key}.description`)}</p>
              <div className="mt-6 h-px bg-border" />
              <p className="mt-4 text-xs font-medium text-primary">{t(`landing.features.items.${key}.detail`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-[#17151b] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{t("landing.steps.eyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("landing.steps.title")}</h2>
            <p className="mt-4 text-base leading-7 text-white/60">{t("landing.steps.description")}</p>
            <Link to="/register" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20">{t("landing.steps.cta")}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3 lg:gap-5">
            {STEPS.map((key, index) => (
              <li key={key} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                <span className="font-musical text-sm text-primary">0{index + 1}</span>
                <h3 className="mt-8 text-base font-semibold">{t(`landing.steps.items.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{t(`landing.steps.items.${key}.description`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">{t("landing.faq.eyebrow")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t("landing.faq.title")}</h2>
        </div>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card px-5 sm:px-7">
          {FAQS.map((key) => (
            <details key={key} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold [&::-webkit-details-marker]:hidden">
                {t(`landing.faq.items.${key}.question`)}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-2xl pr-6 text-sm leading-6 text-muted-foreground">{t(`landing.faq.items.${key}.answer`)}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-center text-primary-foreground shadow-2xl shadow-primary/20 sm:px-10 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("landing.final.title")}</h2>
            <p className="mt-4 text-sm leading-6 text-primary-foreground/80 sm:text-base">{t("landing.final.description")}</p>
            <Link to="/register" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-primary shadow-lg transition-transform hover:-translate-y-0.5">{t("landing.final.cta")}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-foreground"><Guitar className="h-4 w-4 text-primary" />FlowFret</div>
          <p>{t("landing.footer")}</p>
          <div className="flex gap-4"><Link to="/login" className="hover:text-foreground">{t("landing.login")}</Link><Link to="/register" className="hover:text-foreground">{t("landing.getStarted")}</Link></div>
        </div>
      </footer>
    </main>
  );
}
