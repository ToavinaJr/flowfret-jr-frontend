import { Guitar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthHighlights } from "./AuthHighlights";

export function AuthHero() {
  const { t } = useTranslation();
  return (
    <aside className="relative hidden overflow-hidden border-l border-border bg-card lg:flex lg:flex-col lg:justify-between">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 20%, hsl(var(--primary) / 0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 20% 80%, hsl(var(--accent) / 0.14), transparent 50%), hsl(var(--card))",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground) / 0.08) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.08) 1px, transparent 1px)",
          backgroundSize: "48px 28px",
        }}
      />
      <div className="relative z-10 flex flex-1 flex-col justify-center px-10 py-12 xl:px-16">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/40">
          <Guitar className="h-8 w-8 text-primary" />
        </div>
        <h2 className="max-w-md text-3xl font-medium tracking-tight text-foreground xl:text-4xl">
          {t("auth.hero.title")}
        </h2>
        <p className="mt-4 max-w-md text-base text-muted-foreground">
          {t("auth.hero.description")}
        </p>
        <AuthHighlights />
      </div>
    </aside>
  );
}
