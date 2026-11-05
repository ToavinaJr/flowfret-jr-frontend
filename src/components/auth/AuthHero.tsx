import { useTranslation } from "react-i18next";
import { AuthHighlights } from "./AuthHighlights";

export function AuthHero() {
  const { t } = useTranslation();
  return (
    <aside className="hidden min-h-screen overflow-hidden border-l border-border bg-card lg:flex lg:items-center lg:justify-center">
      <div className="w-full max-w-2xl px-10 py-12 xl:px-16">
        <PracticeIllustration label={t("auth.illustrationLabel")} />
        <div className="mt-8 max-w-lg">
          <h2 className="text-3xl font-medium tracking-tight text-foreground xl:text-4xl">
            {t("auth.hero.title")}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {t("auth.hero.description")}
          </p>
        </div>
        <AuthHighlights />
      </div>
    </aside>
  );
}

function PracticeIllustration({ label }: { label: string }) {
  return (
    <svg
      aria-label={label}
      role="img"
      viewBox="0 0 640 320"
      className="h-auto w-full rounded-2xl border border-border bg-background p-5 text-primary sm:p-8"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M28 156h62l16-44 22 96 27-138 29 174 25-120 24 62 26-42 23 22 24-70 26 118 28-58 26 20h86" strokeWidth="4" />
        <path d="M30 244h570M30 262h570" strokeOpacity=".18" strokeWidth="2" />
        <path d="M115 236v16M416 236v16" strokeWidth="3" />
        <rect x="98" y="218" width="46" height="34" rx="7" fill="hsl(var(--primary) / .12)" strokeWidth="2" />
        <rect x="399" y="218" width="46" height="34" rx="7" fill="hsl(var(--primary) / .12)" strokeWidth="2" />
      </g>
      <g fill="currentColor" fontFamily="ui-monospace, monospace" fontSize="14" fontWeight="600">
        <text x="110" y="240">A</text>
        <text x="411" y="240">B</text>
      </g>
      <g fill="none" stroke="currentColor" strokeOpacity=".38" strokeWidth="1.5">
        <path d="M84 286v18M120 286v18M156 286v18M192 286v18M228 286v18M264 286v18M300 286v18M336 286v18M372 286v18M408 286v18M444 286v18M480 286v18M516 286v18M552 286v18" />
      </g>
    </svg>
  );
}
