import { useTranslation } from "react-i18next";

interface MusicSearchEmptyStateProps {
  hasSearched: boolean;
  hasResults: boolean;
}

export function MusicSearchEmptyState({
  hasSearched,
  hasResults,
}: MusicSearchEmptyStateProps) {
  const { t } = useTranslation();

  if (!hasSearched) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {t("music.emptyBeforeSearch")}
      </p>
    );
  }

  if (!hasResults) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {t("music.noResults")}
      </p>
    );
  }

  return null;
}
