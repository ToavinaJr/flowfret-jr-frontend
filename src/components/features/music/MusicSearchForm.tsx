import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MusicSearchFormProps {
  initialQuery?: string;
  loading: boolean;
  onSearch: (query: string) => void;
  recentSearches?: string[];
  onClearRecentSearches?: () => void;
}

export function MusicSearchForm({
  initialQuery = "",
  loading,
  onSearch,
  recentSearches = [],
  onClearRecentSearches,
}: MusicSearchFormProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState(initialQuery);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setLocalError(t("music.queryRequired"));
      return;
    }
    setLocalError(null);
    onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="music-search-query" className="text-sm font-medium text-foreground">
          {t("music.searchLabel")}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="music-search-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("music.searchPlaceholder")}
            disabled={loading}
            maxLength={150}
            autoComplete="off"
            className="min-h-[44px]"
          />
          <Button
            type="submit"
            disabled={loading}
            className="min-h-[44px] sm:min-w-[140px]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("music.searching")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Search className="h-4 w-4" />
                {t("music.search")}
              </span>
            )}
          </Button>
        </div>
      </div>
      {recentSearches.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" aria-label={t("music.recentSearches")}>
          <span className="text-xs text-muted-foreground">{t("music.recentSearches")}</span>
          {recentSearches.map((recent) => (
            <button
              key={recent}
              type="button"
              onClick={() => { setQuery(recent); onSearch(recent); }}
              className="min-h-8 rounded-full border border-border px-3 text-xs text-foreground hover:bg-secondary"
            >
              {recent}
            </button>
          ))}
          {onClearRecentSearches ? (
            <button type="button" onClick={onClearRecentSearches} className="min-h-8 px-2 text-xs text-muted-foreground underline">
              {t("music.clearRecentSearches")}
            </button>
          ) : null}
        </div>
      ) : null}
      {localError ? (
        <p className="text-sm text-destructive" role="alert">
          {localError}
        </p>
      ) : null}
    </form>
  );
}
