import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import type { AdminConnection, AdminListInput } from "@/types/admin";

export interface AdminColumn<T> {
  key: string;
  labelKey: string;
  className?: string;
  render: (row: T) => ReactNode;
}

export interface AdminFilter {
  key:
    | "status"
    | "role"
    | "postStatus"
    | "transcriptionStatus"
    | "uploadStatus"
    | "reportStatus"
    | "provider"
    | "action"
    | "entityType"
    | "from"
    | "to";
  labelKey: string;
  type?: "select" | "text" | "date";
  options?: Array<{ value: string; labelKey: string }>;
}

interface AdminListPageProps<T extends { id: string }> {
  section: "users" | "content" | "media" | "music" | "audit";
  queryKey: string;
  fetchPage: (input: AdminListInput) => Promise<AdminConnection<T>>;
  columns: AdminColumn<T>[];
  action?: ReactNode;
  filters?: AdminFilter[];
  titleKey?: string;
  descriptionKey?: string;
  showIncludeDeleted?: boolean;
  /** Most resources are ordered by createdAt; a few (listening history) sort by a different timestamp, but "newest/oldest first" still applies either way. */
  showSort?: boolean;
}

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 400;

export default function AdminListPage<T extends { id: string }>({
  section,
  queryKey,
  fetchPage,
  columns,
  action,
  filters = [],
  titleKey,
  descriptionKey,
  showIncludeDeleted = true,
  showSort = true,
}: AdminListPageProps<T>) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialFilters = Object.fromEntries(
    filters.flatMap(({ key }) => {
      const value = searchParams.get(key);
      return value ? [[key, value]] : [];
    }),
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>(
    initialFilters,
  );
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [direction, setDirection] = useState<"ASC" | "DESC">("DESC");
  const [cursors, setCursors] = useState<Array<string | undefined>>([
    undefined,
  ]);
  const cursor = cursors[cursors.length - 1];

  // Filters, the deleted-items toggle and sort order apply immediately on
  // change - only free text is debounced, since firing a request on every
  // keystroke would be wasteful. This removes the old requirement to click
  // "Rechercher" after touching a dropdown or date field.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setCursors([undefined]);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useQuery({
    queryKey: [
      "admin",
      queryKey,
      search,
      activeFilters,
      includeDeleted,
      direction,
      cursor,
    ],
    queryFn: () =>
      fetchPage({
        first: PAGE_SIZE,
        ...(cursor ? { after: cursor } : {}),
        ...(search ? { search } : {}),
        ...activeFilters,
        ...(includeDeleted ? { includeDeleted: true } : {}),
        ...(showSort ? { direction } : {}),
      }),
    placeholderData: (previous) => previous,
  });

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setCursors([undefined]);
  }

  function updateFilter(key: string, value: string) {
    setActiveFilters((current) => {
      if (!value) {
        const { [key]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [key]: value };
    });
    setCursors([undefined]);
  }

  function removeFilter(key: string) {
    updateFilter(key, "");
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setActiveFilters({});
    setIncludeDeleted(false);
    setDirection("DESC");
    setCursors([undefined]);
  }

  const hasActiveFilters =
    Boolean(search) || Object.keys(activeFilters).length > 0 || includeDeleted;

  const filterChips = useMemo(
    () =>
      Object.entries(activeFilters).map(([key, value]) => {
        const filter = filters.find((candidate) => candidate.key === key);
        const option = filter?.options?.find((candidate) => candidate.value === value);
        const valueLabel = option ? t(option.labelKey) : value;
        return {
          key,
          label: `${t(filter?.labelKey ?? key)}: ${valueLabel}`,
        };
      }),
    [activeFilters, filters, t],
  );

  const totalCount = query.data?.totalCount ?? 0;
  const currentPage = cursors.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <section aria-labelledby={`admin-${section}-title`}>
      <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            id={`admin-${section}-title`}
            className="text-2xl font-semibold sm:text-3xl"
          >
            {t(titleKey ?? `admin.nav.${section}`)}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(descriptionKey ?? `admin.screens.${section}.description`)}
          </p>
        </div>
        {action}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4">
          <form
            onSubmit={submitSearch}
            className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
          >
            <label className="relative min-w-0 flex-1 sm:max-w-sm">
              <span className="sr-only">{t("admin.search")}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="admin-search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("admin.searchPlaceholder")}
                className="min-h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            {filters.map((filter) => (
              <label
                key={filter.key}
                className="grid gap-1 text-xs text-muted-foreground"
              >
                <span>{t(filter.labelKey)}</span>
                {filter.type === "text" ? (
                  <input
                    type="text"
                    value={activeFilters[filter.key] ?? ""}
                    onChange={(event) =>
                      updateFilter(filter.key, event.target.value)
                    }
                    placeholder={t("admin.filters.value")}
                    className="min-h-11 min-w-36 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : filter.type === "date" ? (
                  <span className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      value={activeFilters[filter.key] ?? ""}
                      onChange={(event) =>
                        updateFilter(filter.key, event.target.value)
                      }
                      className="min-h-11 min-w-36 rounded-lg border border-border bg-background py-0 pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    />
                  </span>
                ) : (
                  <select
                    value={activeFilters[filter.key] ?? ""}
                    onChange={(event) =>
                      updateFilter(filter.key, event.target.value)
                    }
                    className="min-h-11 min-w-36 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("admin.filters.all")}</option>
                    {(filter.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                )}
              </label>
            ))}
            {showSort ? (
              <label className="grid gap-1 text-xs text-muted-foreground">
                <span>{t("admin.filters.sort")}</span>
                <select
                  value={direction}
                  onChange={(event) => {
                    setDirection(event.target.value as "ASC" | "DESC");
                    setCursors([undefined]);
                  }}
                  className="min-h-11 min-w-36 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="DESC">{t("admin.filters.sortNewest")}</option>
                  <option value="ASC">{t("admin.filters.sortOldest")}</option>
                </select>
              </label>
            ) : null}
            {showIncludeDeleted ? (
              <label className="flex min-h-11 items-center gap-2 px-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(event) => {
                    setIncludeDeleted(event.target.checked);
                    setCursors([undefined]);
                  }}
                  className="h-4 w-4 accent-primary"
                />
                {t("admin.filters.includeDeleted")}
              </label>
            ) : null}
            <button
              type="submit"
              className="min-h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {t("admin.search")}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="min-h-11 rounded-lg px-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {t("admin.filters.reset")}
              </button>
            )}
          </form>

          {filterChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {filterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => removeFilter(chip.key)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  {chip.label}
                  <X aria-hidden="true" className="h-3 w-3" />
                </button>
              ))}
            </div>
          ) : null}

          <p
            aria-live="polite"
            className="text-sm tabular-nums text-muted-foreground"
          >
            {t("admin.total", { count: totalCount })}
          </p>
        </div>

        {query.isError ? (
          <div role="alert" className="p-5 text-sm text-destructive">
            <p>{t("admin.loadFailed")}</p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              className="mt-3 min-h-11 rounded-lg bg-secondary px-4 text-foreground"
            >
              {t("common.retry")}
            </button>
          </div>
        ) : null}

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[760px] table-fixed border-collapse text-left text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-4 py-3 font-medium ${column.className ?? ""}`}
                  >
                    {t(column.labelKey)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {query.isLoading
                ? Array.from({ length: 5 }, (_, index) => (
                    <tr key={index}>
                      <td colSpan={columns.length} className="px-4 py-4">
                        <div className="h-5 animate-pulse rounded bg-secondary" />
                      </td>
                    </tr>
                  ))
                : query.data?.nodes.map((row) => (
                    <tr
                      key={row.id}
                      className="align-top hover:bg-secondary/30"
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`min-w-0 whitespace-normal px-4 py-3 [overflow-wrap:anywhere] ${column.className ?? ""}`}
                        >
                          {column.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!query.isLoading && query.data?.nodes.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {t("admin.empty")}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-3 border-t border-border p-3">
          <p className="text-xs tabular-nums text-muted-foreground">
            {t("admin.pageIndicator", { page: currentPage, total: totalPages })}
          </p>
          <button
            type="button"
            aria-label={t("admin.previousPage")}
            disabled={cursors.length === 1 || query.isFetching}
            onClick={() => setCursors((current) => current.slice(0, -1))}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("admin.nextPage")}
            disabled={
              !query.data?.pageInfo.hasNextPage ||
              !query.data?.pageInfo.endCursor ||
              query.isFetching
            }
            onClick={() => {
              const next = query.data?.pageInfo.endCursor;
              if (next) setCursors((current) => [...current, next]);
            }}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function AdminStatus({ value }: { value: string }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex rounded-full bg-secondary px-2 py-1 text-xs font-medium text-foreground">
      {t(`admin.values.${value}`, { defaultValue: value })}
    </span>
  );
}
