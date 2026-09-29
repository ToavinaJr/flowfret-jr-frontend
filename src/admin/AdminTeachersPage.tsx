import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { graphqlRequest } from "@/services/graphqlClient";

type TeacherApplication = {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  headline: string | null;
  biography: string | null;
  experienceYears: number | null;
  specialties: string[];
  languages: string[];
};

const fields =
  "id userId status headline biography experienceYears specialties languages";

export default function AdminTeachersPage() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await graphqlRequest<{
      adminInstructorProfiles: TeacherApplication[];
    }>({
      query: `query AdminInstructorProfiles { adminInstructorProfiles { ${fields} } }`,
    });
    setApplications(result.adminInstructorProfiles);
  }, []);

  useEffect(() => {
    void load()
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error ? error.message : "Chargement impossible.",
        ),
      )
      .finally(() => setLoading(false));
  }, [load]);

  async function review(
    application: TeacherApplication,
    status: "APPROVED" | "REJECTED" | "SUSPENDED",
  ) {
    setBusyId(application.id);
    try {
      await graphqlRequest({
        query: `mutation ReviewInstructorProfile($id: String!, $status: InstructorStatus!) { reviewInstructorProfile(id: $id, status: $status) { id status } }`,
        variables: { id: application.id, status },
      });
      await load();
      toast.success("Statut du profil enseignant mis à jour.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Modification impossible.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>Profils enseignants</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Examinez les demandes. Seuls les profils approuvés peuvent publier leurs
        cours.
      </p>
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun profil enseignant.
        </p>
      ) : (
        <div className="space-y-3">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">
                    {application.headline || "Profil enseignant"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Compte {application.userId} · {application.status} ·{" "}
                    {application.experienceYears ?? 0} ans d’expérience
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {application.status !== "APPROVED" && (
                    <Button
                      size="sm"
                      disabled={busyId === application.id}
                      onClick={() => void review(application, "APPROVED")}
                    >
                      Approuver
                    </Button>
                  )}
                  {application.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === application.id}
                      onClick={() => void review(application, "REJECTED")}
                    >
                      Refuser
                    </Button>
                  )}
                  {application.status !== "SUSPENDED" &&
                    application.status === "APPROVED" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === application.id}
                        onClick={() => void review(application, "SUSPENDED")}
                      >
                        Suspendre
                      </Button>
                    )}
                </div>
              </div>
              {application.biography && (
                <p className="mt-3 whitespace-pre-wrap text-sm">
                  {application.biography}
                </p>
              )}
              {!!application.specialties.length && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Spécialités : {application.specialties.join(", ")}
                </p>
              )}
              {!!application.languages.length && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Langues : {application.languages.join(", ")}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
