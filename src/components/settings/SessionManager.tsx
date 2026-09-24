import { useEffect, useState } from "react";
import {
  fetchAccountSessions,
  revokeAccountSession,
  type AccountSession,
} from "@/services/accountApi";
import { useTranslation } from "react-i18next";

export function SessionManager() {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAccountSessions().then(setSessions).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : t("common.loadFailed"));
    });
  }, [t]);

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-semibold">{t("account.sessions.title")}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("account.sessions.description")}
      </p>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-3 space-y-2">
        {sessions.map((session) => (
          <div key={session.id} className="flex items-center gap-3 rounded-md bg-secondary p-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{t(session.current ? "account.sessions.current" : "account.sessions.other")}</p>
              <p className="text-xs text-muted-foreground">
                {t("account.sessions.createdAt", {
                  date: new Date(session.createdAt).toLocaleString(i18n.language),
                })}
              </p>
            </div>
            {!session.current && (
              <button
                type="button"
                onClick={async () => {
                  await revokeAccountSession(session.id);
                  setSessions((current) => current.filter((item) => item.id !== session.id));
                }}
                className="min-h-10 rounded-md border border-border px-3 text-xs hover:text-destructive"
              >
                {t("account.sessions.revoke")}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
