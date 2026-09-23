import { useEffect, useState } from "react";
import {
  fetchAccountSessions,
  revokeAccountSession,
  type AccountSession,
} from "@/services/accountApi";

export function SessionManager() {
  const [sessions, setSessions] = useState<AccountSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAccountSessions().then(setSessions).catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "Chargement impossible");
    });
  }, []);

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-semibold">Sessions actives</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Révoquez les appareils que vous ne reconnaissez pas.
      </p>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-3 space-y-2">
        {sessions.map((session) => (
          <div key={session.id} className="flex items-center gap-3 rounded-md bg-secondary p-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{session.current ? "Session actuelle" : "Autre session"}</p>
              <p className="text-xs text-muted-foreground">
                Créée le {new Date(session.createdAt).toLocaleString()}
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
                Révoquer
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
