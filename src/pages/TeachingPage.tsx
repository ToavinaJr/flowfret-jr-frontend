import { useCallback, useEffect, useState } from "react";
import { BookOpen, GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  archiveTeachingCourse,
  createTeachingCourse,
  fetchTeachingWorkspace,
  requestTeachingEnrollment,
  saveInstructorProfile,
  updateTeachingCourse,
  type InstructorProfile,
  type TeachingCourse,
} from "@/services/teachingApi";

const cardClass = "rounded-xl border border-border bg-card p-4 sm:p-5";

export default function TeachingPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [myCourses, setMyCourses] = useState<TeachingCourse[]>([]);
  const [enrolled, setEnrolled] = useState<TeachingCourse[]>([]);
  const [catalog, setCatalog] = useState<TeachingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [headline, setHeadline] = useState("");
  const [biography, setBiography] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [duration, setDuration] = useState("45");

  const refresh = useCallback(async () => {
    const data = await fetchTeachingWorkspace();
    setProfile(data.myInstructorProfile);
    setMyCourses(data.myTeachingCourses);
    setEnrolled(data.myEnrolledTeachingCourses);
    setCatalog(data.publishedTeachingCourses);
    setHeadline(data.myInstructorProfile?.headline ?? "");
    setBiography(data.myInstructorProfile?.biography ?? "");
    setExperienceYears(String(data.myInstructorProfile?.experienceYears ?? 0));
  }, []);

  useEffect(() => {
    void refresh()
      .catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Impossible de charger les cours."))
      .finally(() => setLoading(false));
  }, [refresh]);

  async function saveTeacher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      setProfile(await saveInstructorProfile({ headline, biography, experienceYears: Number(experienceYears) }));
      toast.success("Profil enseignant enregistré. Il sera validé par l’équipe FlowFret.");
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enregistrement impossible.");
    } finally { setBusy(false); }
  }

  async function addCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await createTeachingCourse({
        title, description, level: "Tous niveaux", format: "INDIVIDUAL", maxStudents: 1,
        teachingMode: "HYBRID", priceAmount: Math.round(Number(price) * 100),
        priceCurrency: currency.toUpperCase(), priceUnit: "PER_LESSON", durationMinutes: Number(duration),
      });
      setTitle(""); setDescription(""); setPrice("");
      await refresh();
      toast.success("Cours créé en brouillon.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Création du cours impossible.");
    } finally { setBusy(false); }
  }

  async function setPublished(course: TeachingCourse) {
    setBusy(true);
    try {
      await updateTeachingCourse(course.id, { status: course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
      await refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Modification impossible."); }
    finally { setBusy(false); }
  }

  async function archive(course: TeachingCourse) {
    setBusy(true);
    try { await archiveTeachingCourse(course.id); await refresh(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Archivage impossible."); }
    finally { setBusy(false); }
  }

  async function enroll(course: TeachingCourse) {
    setBusy(true);
    try {
      await requestTeachingEnrollment(course.id);
      await refresh();
      toast.success("Demande envoyée à l’enseignant.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Demande impossible."); }
    finally { setBusy(false); }
  }

  const myEnrollmentIds = new Set(enrolled.map((course) => course.id));
  const visibleCatalog = catalog.filter((course) => course.instructorId !== profile?.id);

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>Cours de guitare</h1>
      <p className="mb-6 text-sm text-muted-foreground">Trouvez un enseignant, gérez vos cours ou proposez vos leçons payantes.</p>
      {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : (
        <div className="space-y-8">
          <section className={cardClass}>
            <div className="mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /><h2 className="font-semibold">Mon profil enseignant</h2></div>
            {profile && <p className="mb-3 text-sm text-muted-foreground">Statut : <strong>{profile.status === "APPROVED" ? "Approuvé" : profile.status === "PENDING" ? "En attente de validation" : profile.status}</strong></p>}
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={saveTeacher}>
              <Input value={headline} onChange={(event) => setHeadline(event.target.value)} maxLength={160} placeholder="Présentation courte" aria-label="Présentation courte" />
              <Input type="number" min="0" max="60" value={experienceYears} onChange={(event) => setExperienceYears(event.target.value)} aria-label="Années d’expérience" placeholder="Années d’expérience" />
              <textarea className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm sm:col-span-2" value={biography} onChange={(event) => setBiography(event.target.value)} maxLength={3000} placeholder="Votre expérience et votre approche pédagogique" aria-label="Biographie enseignant" />
              <Button disabled={busy} className="sm:col-span-2">Enregistrer le profil</Button>
            </form>
          </section>

          <section className={cardClass}>
            <div className="mb-4 flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /><h2 className="font-semibold">Créer un cours individuel payant</h2></div>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={addCourse}>
              <Input required minLength={3} maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre du cours" aria-label="Titre du cours" />
              <Input required type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Prix par séance" aria-label="Prix par séance" />
              <Input required minLength={3} maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="Devise (EUR)" aria-label="Devise" />
              <Input required type="number" min="15" max="480" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Durée en minutes" aria-label="Durée en minutes" />
              <textarea className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm sm:col-span-2" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={5000} placeholder="Description du cours" aria-label="Description du cours" />
              <Button disabled={busy || !profile} className="sm:col-span-2">{profile ? "Créer le brouillon" : "Enregistrez d’abord votre profil enseignant"}</Button>
            </form>
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Mes cours</h2>
            {myCourses.length === 0 ? <p className="text-sm text-muted-foreground">Aucun cours créé.</p> : <div className="grid gap-3">{myCourses.map((course) => <article key={course.id} className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}><div><h3 className="font-medium">{course.title}</h3><p className="text-sm text-muted-foreground">{formatMoney(course.priceAmount, course.priceCurrency)} par séance · {course.durationMinutes} min · {course.status}</p></div><div className="flex gap-2"><Button variant="outline" disabled={busy || profile?.status !== "APPROVED" && course.status !== "PUBLISHED"} onClick={() => void setPublished(course)}>{course.status === "PUBLISHED" ? "Dépublier" : "Publier"}</Button><Button variant="ghost" disabled={busy} onClick={() => void archive(course)}>Archiver</Button></div></article>)}</div>}
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h2 className="font-semibold">Cours disponibles</h2></div>
            {visibleCatalog.length === 0 ? <p className="text-sm text-muted-foreground">Aucun cours publié pour le moment.</p> : <div className="grid gap-3">{visibleCatalog.map((course) => <article key={course.id} className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}><div><h3 className="font-medium">{course.title}</h3><p className="text-sm text-muted-foreground">{course.description || "Cours de guitare"} · {formatMoney(course.priceAmount, course.priceCurrency)} · {course.durationMinutes} min</p></div><Button disabled={busy || myEnrollmentIds.has(course.id)} onClick={() => void enroll(course)}>{myEnrollmentIds.has(course.id) ? "Demande envoyée" : "Demander une place"}</Button></article>)}</div>}
          </section>
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">Votre compte FlowFret : {user?.username}. Les inscriptions actives sont confirmées par l’enseignant après accord de paiement.</p>
    </div>
  );
}

function formatMoney(minorAmount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).format(minorAmount / 100);
}
