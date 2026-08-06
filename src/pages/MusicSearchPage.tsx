import { useTranslation } from "react-i18next";
import { MusicSearchForm } from "@/components/features/music/MusicSearchForm";
import { MusicSearchResults } from "@/components/features/music/MusicSearchResults";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useMusicSearch } from "@/hooks/useMusicSearch";

const MusicSearchPage = () => {
  const { t } = useTranslation();
  const { results, loading, error, hasSearched, search } = useMusicSearch();

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("music.title")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("music.subtitle")}</p>

      <div className="space-y-6">
        <MusicSearchForm loading={loading} onSearch={search} />
        <MusicSearchResults
          loading={loading}
          error={error}
          hasSearched={hasSearched}
          results={results}
        />
      </div>
    </div>
  );
};

export default MusicSearchPage;
