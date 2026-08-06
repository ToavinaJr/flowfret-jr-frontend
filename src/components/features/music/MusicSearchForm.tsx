import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MusicSearchFormProps {
  initialQuery?: string;
  loading: boolean;
  onSearch: (query: string) => void;
}

export function MusicSearchForm({
  initialQuery = "",
  loading,
  onSearch,
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
      {localError ? (
        <p className="text-sm text-destructive" role="alert">
          {localError}
        </p>
      ) : null}
    </form>
  );
}
