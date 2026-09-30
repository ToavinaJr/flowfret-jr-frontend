import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  createAdminManagedEntity,
  deleteAdminManagedEntity,
  fetchAdminManagedEntities,
  restoreAdminManagedEntity,
  updateAdminManagedEntity,
} from "@/services/adminApi";
import { ADMIN_MANAGED_ENTITIES, type AdminManagedEntity } from "@/types/admin";

const RESTORABLE = new Set<AdminManagedEntity>([
  "PROFILE",
  "POST",
  "COMMENT",
  "FRIENDSHIP",
  "UPLOAD",
  "NOTIFICATION",
  "POST_LIKE",
  "POST_REPORT",
  "POST_MENTION",
  "COMMENT_MENTION",
  "POST_ATTACHMENT",
  "TRANSCRIPTION",
  "PLAYLIST",
]);
const EDITABLE_FIELDS: Record<AdminManagedEntity, string[]> = {
  USER: ["email", "username"],
  PROFILE: [
    "userId",
    "displayName",
    "avatarUrl",
    "bio",
    "location",
    "websiteUrl",
    "level",
    "visibility",
  ],
  POST: [
    "authorId",
    "content",
    "coverImageUrl",
    "audioUrl",
    "visibility",
    "status",
  ],
  COMMENT: ["postId", "authorId", "content", "status"],
  FRIENDSHIP: ["requesterId", "receiverId", "status"],
  UPLOAD: [
    "userId",
    "fileName",
    "fileType",
    "fileSize",
    "storagePath",
    "storagePublicId",
    "cleanupPending",
    "duration",
    "status",
    "sourceType",
  ],
  NOTIFICATION: ["userId", "type", "payload", "readAt"],
  NOTIFICATION_PREFERENCE: ["userId", "type", "enabled"],
  POST_LIKE: ["postId", "userId"],
  POST_REPORT: ["postId", "reporterId", "reason", "status", "reviewedAt"],
  POST_MENTION: ["postId", "userId"],
  COMMENT_MENTION: ["commentId", "userId"],
  POST_ATTACHMENT: ["postId", "uploadId", "kind", "position"],
  TRANSCRIPTION: [
    "provider",
    "trackId",
    "title",
    "artist",
    "requestedLanguage",
    "detectedLanguage",
    "model",
    "engineVersion",
    "status",
    "progress",
    "bufferedUntil",
    "duration",
    "readyToPlay",
    "segments",
    "lrcContent",
    "errorCode",
    "errorMessage",
    "attempts",
    "manualRetryCount",
    "processingPhase",
    "completedAt",
  ],
  CHORD_TRANSCRIPTION: [
    "provider",
    "providerTrackId",
    "title",
    "artist",
    "duration",
    "cues",
    "engineVersion",
  ],
  LISTENING_HISTORY: [
    "userId",
    "provider",
    "providerTrackId",
    "title",
    "artists",
    "imageUrl",
    "externalUrl",
    "streamUrl",
    "album",
    "genre",
    "isrc",
    "durationMs",
    "playCount",
    "lastPlayedAt",
  ],
  CATALOG_TRACK: [
    "provider",
    "providerTrackId",
    "title",
    "artists",
    "album",
    "genre",
    "imageUrl",
    "externalUrl",
    "durationMs",
    "isrc",
  ],
  PLAYLIST: ["userId", "name", "description", "coverUrl", "visibility"],
  PLAYLIST_ITEM: ["playlistId", "trackId", "addedById", "position"],
  TRANSCRIPTION_ACCESS: ["userId", "transcriptionId"],
};
const IMMUTABLE_KEYS: Partial<Record<AdminManagedEntity, string[]>> = {
  NOTIFICATION_PREFERENCE: ["userId", "type"],
  POST_MENTION: ["postId", "userId"],
  COMMENT_MENTION: ["commentId", "userId"],
  TRANSCRIPTION_ACCESS: ["userId", "transcriptionId"],
};

export default function AdminEntityManagerPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [entity, setEntity] = useState<AdminManagedEntity>(() => {
    const requested = searchParams.get("entity");
    return ADMIN_MANAGED_ENTITIES.find((candidate) => candidate === requested) ?? "PROFILE";
  });
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState(() => searchParams.get("from") ?? "");
  const [to, setTo] = useState(() => searchParams.get("to") ?? "");
  const [recordId, setRecordId] = useState<string | null>(null);
  const [draft, setDraft] = useState("{}");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const query = useQuery({
    queryKey: ["admin", "managed-entities", entity, includeDeleted, from, to, skip],
    queryFn: () =>
      fetchAdminManagedEntities({ entity, first: 50, skip, includeDeleted, ...(from ? { from } : {}), ...(to ? { to } : {}) }),
    staleTime: 15_000,
  });
  const mutation = useMutation({
    mutationFn: async () => {
      const data = JSON.parse(draft) as Record<string, unknown>;
      const input = { entity, ...(recordId ? { recordId } : {}), data, reason };
      return recordId
        ? updateAdminManagedEntity(input)
        : createAdminManagedEntity(input);
    },
    onSuccess: () => {
      setError("");
      setEditorOpen(false);
      setRecordId(null);
      setReason("");
      void queryClient.invalidateQueries({
        queryKey: ["admin", "managed-entities", entity],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "statistics"] });
    },
    onError: (cause) =>
      setError(
        cause instanceof Error
          ? cause.message
          : t("admin.entities.actionFailed"),
      ),
  });
  const rows = useMemo(
    () =>
      (query.data?.nodes ?? []).filter(
        (row) =>
          !search ||
          JSON.stringify(row)
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()),
      ),
    [query.data?.nodes, search],
  );

  function startCreate() {
    setRecordId(null);
    setDraft(JSON.stringify(Object.fromEntries(EDITABLE_FIELDS[entity].map((field) => [field, null])), null, 2));
    setReason("");
    setError("");
    setEditorOpen(true);
  }

  function startEdit(row: Record<string, unknown> & { _adminId: string }) {
    const editable = Object.fromEntries(
      EDITABLE_FIELDS[entity]
        .filter((field) => !IMMUTABLE_KEYS[entity]?.includes(field))
        .filter((field) => field in row)
        .map((field) => [field, row[field]]),
    );
    setRecordId(row._adminId);
    setDraft(JSON.stringify(editable, null, 2));
    setReason("");
    setError("");
    setEditorOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const data: unknown = JSON.parse(draft);
      if (!data || typeof data !== "object" || Array.isArray(data))
        throw new Error("JSON_OBJECT_REQUIRED");
      mutation.mutate();
    } catch (cause) {
      setError(
        cause instanceof Error && cause.message === "JSON_OBJECT_REQUIRED"
          ? t("admin.entities.objectRequired")
          : t("admin.entities.invalidJson"),
      );
    }
  }

  function deleteRow(id: string) {
    const why = window.prompt(t("admin.entities.reasonPrompt"));
    if (!why?.trim()) return;
    setError("");
    deleteAdminManagedEntity({ entity, recordId: id, reason: why })
      .then(() => {
        void queryClient.invalidateQueries({
          queryKey: ["admin", "managed-entities", entity],
        });
        void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
      })
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error
            ? cause.message
            : t("admin.entities.actionFailed"),
        ),
      );
  }

  function restoreRow(id: string) {
    const why = window.prompt(t("admin.entities.reasonPrompt"));
    if (!why?.trim()) return;
    restoreAdminManagedEntity({ entity, recordId: id, reason: why })
      .then(() => {
        void queryClient.invalidateQueries({
          queryKey: ["admin", "managed-entities", entity],
        });
        void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
      })
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error
            ? cause.message
            : t("admin.entities.actionFailed"),
        ),
      );
  }

  return (
    <section aria-labelledby="admin-entities-title">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            id="admin-entities-title"
            className="text-2xl font-semibold sm:text-3xl"
          >
            {t("admin.entities.title")}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {t("admin.entities.description")}
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          {t("admin.entities.create")}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <label className="grid gap-1 text-sm">
          <span>{t("admin.entities.entity")}</span>
          <select
            value={entity}
            onChange={(event) => {
              setEntity(event.target.value as AdminManagedEntity);
              setSkip(0);
              setEditorOpen(false);
            }}
            className="min-h-11 min-w-64 rounded-lg border border-border bg-background px-3"
          >
            {ADMIN_MANAGED_ENTITIES.map((item) => (
              <option key={item} value={item}>
                {t(`admin.entities.names.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="relative min-w-52 flex-1">
          <span className="sr-only">{t("admin.search")}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("admin.searchPlaceholder")}
            className="min-h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          <span>{t("admin.filters.from")}</span>
          <input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setSkip(0); }} className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
        </label>
        <label className="grid gap-1 text-xs text-muted-foreground">
          <span>{t("admin.filters.to")}</span>
          <input type="date" value={to} onChange={(event) => { setTo(event.target.value); setSkip(0); }} className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground" />
        </label>
        {RESTORABLE.has(entity) && (
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(event) => {
                setIncludeDeleted(event.target.checked);
                setSkip(0);
              }}
              className="h-4 w-4 accent-primary"
            />
            {t("admin.filters.includeDeleted")}
          </label>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {t("admin.total", { count: query.data?.totalCount ?? 0 })}
        </span>
      </div>

      {editorOpen && (
        <form
          onSubmit={submit}
          className="mb-5 rounded-xl border border-primary/30 bg-card p-4 sm:p-5"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">
              {t(
                recordId
                  ? "admin.entities.edit"
                  : "admin.entities.createEntity",
                { entity: t(`admin.entities.names.${entity}`) },
              )}
            </h2>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              aria-label={t("admin.entities.closeEditor")}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            {t("admin.entities.jsonHelp")}
          </p>
          <label className="grid gap-1 text-sm">
            <span>{t("admin.entities.recordData")}</span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={12}
              spellCheck={false}
              className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs"
            />
          </label>
          <label className="mt-3 grid gap-1 text-sm">
            <span>{t("admin.entities.reason")}</span>
            <input
              required
              minLength={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="min-h-11 rounded-lg border border-border bg-background px-3"
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {mutation.isPending
                ? t("common.loading")
                : t("admin.entities.save")}
            </button>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="min-h-11 rounded-lg bg-secondary px-4 text-sm"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>
      )}

      {error && !editorOpen && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 p-3 text-sm text-destructive"
        >
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}
      {query.isError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card p-5 text-sm"
        >
          <p>{t("admin.loadFailed")}</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-3 min-h-11 rounded-lg bg-secondary px-4"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {query.isLoading ? (
            <p className="p-6 text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          ) : rows.length ? (
            <div className="divide-y divide-border">
              {rows.map((row) => (
                <article
                  key={row._adminId}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-mono text-xs text-muted-foreground">
                      {row._adminId}
                    </p>
                    <pre className="mt-2 max-h-36 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-secondary/40 p-3 text-xs">
                      {JSON.stringify(row, null, 2)}
                    </pre>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {row.isDeleted === true && RESTORABLE.has(entity) ? (
                      <button
                        type="button"
                        onClick={() => restoreRow(row._adminId)}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-3 text-sm"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {t("admin.entities.restore")}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-3 text-sm"
                        >
                          <Pencil className="h-4 w-4" />
                          {t("admin.entities.editAction")}
                        </button>
                        {entity !== "USER" && (
                          <button
                            type="button"
                            onClick={() => deleteRow(row._adminId)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-destructive/10 px-3 text-sm text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t("admin.entities.delete")}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">
              {t("admin.empty")}
            </p>
          )}
        </div>
      )}
      {query.data && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {t("admin.entities.range", {
              from: query.data.totalCount ? skip + 1 : 0,
              to: Math.min(skip + 50, query.data.totalCount),
              total: query.data.totalCount,
            })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={skip === 0 || query.isFetching}
              onClick={() => setSkip(Math.max(0, skip - 50))}
              className="min-h-11 rounded-lg border border-border px-3 text-sm disabled:opacity-40"
            >
              {t("admin.previousPage")}
            </button>
            <button
              type="button"
              disabled={skip + 50 >= query.data.totalCount || query.isFetching}
              onClick={() => setSkip(skip + 50)}
              className="min-h-11 rounded-lg border border-border px-3 text-sm disabled:opacity-40"
            >
              {t("admin.nextPage")}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
