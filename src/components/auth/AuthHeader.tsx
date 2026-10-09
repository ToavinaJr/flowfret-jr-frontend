import { Guitar } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const { t } = useTranslation();

  return (
    <div>
      <Link to="/" className="mb-8 flex w-fit items-center gap-2" aria-label={t("landing.brand")}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Guitar className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
        </div>
        <span className="text-display text-lg text-foreground">FlowFret</span>
      </Link>

      <div className="mb-2 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
        {title}
      </div>
      <p className="mb-6 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
