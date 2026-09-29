import { useCallback, useEffect, useState } from "react";
import { BookOpen, GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  archiveTeachingCourse,
  cancelTeachingLesson,
  completeTeachingLesson,
  createTeachingCourse,
  fetchTeachingLessons,
  fetchTeachingWorkspace,
  markTeachingLessonAttendance,
  requestTeachingEnrollment,
  rescheduleTeachingLesson,
  scheduleTeachingLesson,
  respondToTeachingInvitation,
  saveInstructorProfile,
  updateTeachingCourse,
  type InstructorProfile,
  type TeachingCourse,
  type TeachingLesson,
  type TeachingLessonInput,
} from "@/services/teachingApi";

const cardClass = "rounded-xl border border-border bg-card p-4 sm:p-5";

export default function TeachingPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [myCourses, setMyCourses] = useState<TeachingCourse[]>([]);
  const [enrolled, setEnrolled] = useState<TeachingCourse[]>([]);
  const [enrollments, setEnrollments] = useState<
    Awaited<ReturnType<typeof fetchTeachingWorkspace>>["myTeachingEnrollments"]
  >([]);
  const [catalog, setCatalog] = useState<TeachingCourse[]>([]);
  const [lessons, setLessons] = useState<TeachingLesson[]>([]);
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
  const [lessonCourseId, setLessonCourseId] = useState("");
  const [lessonStartsAt, setLessonStartsAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [lessonMode, setLessonMode] = useState<"IN_PERSON" | "ONLINE">(
    "IN_PERSON",
  );
  const [lessonLocation, setLessonLocation] = useState("");
  const [lessonMeetingUrl, setLessonMeetingUrl] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetchTeachingWorkspace();
    const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const to = new Date(from.getTime() + 45 * 24 * 60 * 60 * 1000);
    const calendar = await fetchTeachingLessons(
      from.toISOString(),
      to.toISOString(),
    );
    setProfile(data.myInstructorProfile);
    setMyCourses(data.myTeachingCourses);
    setEnrolled(data.myEnrolledTeachingCourses);
    setEnrollments(data.myTeachingEnrollments);
    setCatalog(data.publishedTeachingCourses);
    setLessons(calendar);
    if (!lessonCourseId) {
      const firstPublished = data.myTeachingCourses.find(
        (course) => course.status === "PUBLISHED",
      );
      if (firstPublished) setLessonCourseId(firstPublished.id);
    }
    setHeadline(data.myInstructorProfile?.headline ?? "");
    setBiography(data.myInstructorProfile?.biography ?? "");
    setExperienceYears(String(data.myInstructorProfile?.experienceYears ?? 0));
  }, [lessonCourseId]);

  useEffect(() => {
    void refresh()
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de charger les cours.",
        ),
      )
      .finally(() => setLoading(false));
  }, [refresh]);

  async function saveTeacher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      setProfile(
        await saveInstructorProfile({
          headline,
          biography,
          experienceYears: Number(experienceYears),
        }),
      );
      toast.success(
        "Profil enseignant enregistré. Il sera validé par l’équipe FlowFret.",
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Enregistrement impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await createTeachingCourse({
        title,
        description,
        level: "Tous niveaux",
        format: "INDIVIDUAL",
        maxStudents: 1,
        teachingMode: "HYBRID",
        priceAmount: Math.round(Number(price) * 100),
        priceCurrency: currency.toUpperCase(),
        priceUnit: "PER_LESSON",
        durationMinutes: Number(duration),
      });
      setTitle("");
      setDescription("");
      setPrice("");
      await refresh();
      toast.success("Cours créé en brouillon.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Création du cours impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function setPublished(course: TeachingCourse) {
    setBusy(true);
    try {
      await updateTeachingCourse(course.id, {
        status: course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      });
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Modification impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function archive(course: TeachingCourse) {
    setBusy(true);
    try {
      await archiveTeachingCourse(course.id);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Archivage impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function enroll(course: TeachingCourse) {
    setBusy(true);
    try {
      await requestTeachingEnrollment(course.id);
      await refresh();
      toast.success("Demande envoyée à l’enseignant.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Demande impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function answerInvitation(enrollmentId: string, accept: boolean) {
    setBusy(true);
    try {
      await respondToTeachingInvitation(enrollmentId, accept);
      await refresh();
      toast.success(
        accept
          ? "Invitation acceptée. L’enseignant confirmera la place et le paiement."
          : "Invitation refusée.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de traiter l’invitation.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const course = myCourses.find((row) => row.id === lessonCourseId);
    if (!course) return;
    setBusy(true);
    try {
      await scheduleTeachingLesson(
        course.id,
        lessonInput(
          lessonStartsAt,
          lessonMode,
          lessonLocation,
          lessonMeetingUrl,
        ),
      );
      await refresh();
      toast.success("Séance planifiée et élèves notifiés.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Planification impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function moveLesson(lesson: TeachingLesson, startsAt: string) {
    setBusy(true);
    try {
      await rescheduleTeachingLesson(lesson.id, {
        startsAt: new Date(startsAt).toISOString(),
        timeZone: currentTimeZone(),
        teachingMode: lesson.teachingMode === "ONLINE" ? "ONLINE" : "IN_PERSON",
        location: lesson.location,
        meetingUrl: lesson.meetingUrl,
      });
      await refresh();
      toast.success("Séance déplacée et élèves notifiés.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Déplacement impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function cancelLesson(lesson: TeachingLesson) {
    setBusy(true);
    try {
      await cancelTeachingLesson(lesson.id);
      await refresh();
      toast.success("Séance annulée et élèves notifiés.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Annulation impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function completeLesson(lesson: TeachingLesson) {
    setBusy(true);
    try {
      await completeTeachingLesson(lesson.id);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de terminer la séance.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function setAttendance(
    lesson: TeachingLesson,
    enrollmentId: string,
    status: "PRESENT" | "ABSENT" | "EXCUSED",
  ) {
    setBusy(true);
    try {
      await markTeachingLessonAttendance(lesson.id, enrollmentId, status);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Mise à jour de présence impossible.",
      );
    } finally {
      setBusy(false);
    }
  }

  const myEnrollmentIds = new Set(enrolled.map((course) => course.id));
  const selectedLessonCourse = () =>
    myCourses.find((course) => course.id === lessonCourseId);
  const visibleCatalog = catalog.filter(
    (course) => course.instructorId !== profile?.id,
  );

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>Cours de guitare</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Trouvez un enseignant, gérez vos cours ou proposez vos leçons payantes.
      </p>
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="space-y-8">
          <section className={cardClass}>
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Mon profil enseignant</h2>
            </div>
            {profile && (
              <p className="mb-3 text-sm text-muted-foreground">
                Statut :{" "}
                <strong>
                  {profile.status === "APPROVED"
                    ? "Approuvé"
                    : profile.status === "PENDING"
                      ? "En attente de validation"
                      : profile.status}
                </strong>
              </p>
            )}
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={saveTeacher}>
              <Input
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                maxLength={160}
                placeholder="Présentation courte"
                aria-label="Présentation courte"
              />
              <Input
                type="number"
                min="0"
                max="60"
                value={experienceYears}
                onChange={(event) => setExperienceYears(event.target.value)}
                aria-label="Années d’expérience"
                placeholder="Années d’expérience"
              />
              <textarea
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm sm:col-span-2"
                value={biography}
                onChange={(event) => setBiography(event.target.value)}
                maxLength={3000}
                placeholder="Votre expérience et votre approche pédagogique"
                aria-label="Biographie enseignant"
              />
              <Button disabled={busy} className="sm:col-span-2">
                Enregistrer le profil
              </Button>
            </form>
          </section>

          <section className={cardClass}>
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">
                Créer un cours individuel payant
              </h2>
            </div>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={addCourse}>
              <Input
                required
                minLength={3}
                maxLength={160}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Titre du cours"
                aria-label="Titre du cours"
              />
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Prix par séance"
                aria-label="Prix par séance"
              />
              <Input
                required
                minLength={3}
                maxLength={3}
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                placeholder="Devise (EUR)"
                aria-label="Devise"
              />
              <Input
                required
                type="number"
                min="15"
                max="480"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="Durée en minutes"
                aria-label="Durée en minutes"
              />
              <textarea
                className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm sm:col-span-2"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={5000}
                placeholder="Description du cours"
                aria-label="Description du cours"
              />
              <Button disabled={busy || !profile} className="sm:col-span-2">
                {profile
                  ? "Créer le brouillon"
                  : "Enregistrez d’abord votre profil enseignant"}
              </Button>
            </form>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold">
                Calendrier — dernières séances et 45 prochains jours
              </h2>
              <span className="text-xs text-muted-foreground">
                {currentTimeZone()}
              </span>
            </div>
            {profile?.status === "APPROVED" &&
              myCourses.some((course) => course.status === "PUBLISHED") && (
                <form
                  onSubmit={addLesson}
                  className={`${cardClass} mb-4 grid gap-3 sm:grid-cols-2`}
                >
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    required
                    value={lessonCourseId}
                    onChange={(event) => {
                      setLessonCourseId(event.target.value);
                      const next = myCourses.find(
                        (course) => course.id === event.target.value,
                      );
                      if (next?.teachingMode === "ONLINE")
                        setLessonMode("ONLINE");
                      if (next?.teachingMode === "IN_PERSON")
                        setLessonMode("IN_PERSON");
                    }}
                    aria-label="Cours à planifier"
                  >
                    {myCourses
                      .filter((course) => course.status === "PUBLISHED")
                      .map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                  </select>
                  <Input
                    required
                    type="datetime-local"
                    value={lessonStartsAt}
                    onChange={(event) => setLessonStartsAt(event.target.value)}
                    aria-label="Date et heure de la séance"
                  />
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={lessonMode}
                    onChange={(event) =>
                      setLessonMode(
                        event.target.value as "IN_PERSON" | "ONLINE",
                      )
                    }
                    aria-label="Mode de la séance"
                  >
                    {selectedLessonCourse()?.teachingMode !== "ONLINE" && (
                      <option value="IN_PERSON">Présentiel</option>
                    )}
                    {selectedLessonCourse()?.teachingMode !== "IN_PERSON" && (
                      <option value="ONLINE">À distance</option>
                    )}
                  </select>
                  {lessonMode === "IN_PERSON" ? (
                    <Input
                      required
                      value={lessonLocation}
                      onChange={(event) =>
                        setLessonLocation(event.target.value)
                      }
                      maxLength={500}
                      placeholder="Lieu"
                      aria-label="Lieu"
                    />
                  ) : (
                    <Input
                      required
                      type="url"
                      value={lessonMeetingUrl}
                      onChange={(event) =>
                        setLessonMeetingUrl(event.target.value)
                      }
                      placeholder="Lien HTTPS de la réunion"
                      aria-label="Lien de réunion"
                    />
                  )}
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    La durée est celle du cours. L’horaire sera enregistré avec
                    le fuseau affiché ci-dessus.
                  </p>
                  <Button disabled={busy} className="sm:col-span-2">
                    Planifier une séance
                  </Button>
                </form>
              )}
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune séance récente ou à venir.
              </p>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const isTeacher = lesson.createdById === user?.id;
                  return (
                    <article key={lesson.id} className={cardClass}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium">{lesson.courseTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatLessonDate(lesson.startsAt, lesson.timeZone)}{" "}
                            ·{" "}
                            {lesson.teachingMode === "ONLINE"
                              ? "À distance"
                              : "Présentiel"}{" "}
                            · {lesson.status}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {lesson.location ||
                              (lesson.meetingUrl ? (
                                <a
                                  href={lesson.meetingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary underline"
                                >
                                  Rejoindre la réunion
                                </a>
                              ) : (
                                ""
                              ))}
                          </p>
                        </div>
                        {isTeacher && lesson.status === "SCHEDULED" && (
                          <div className="flex flex-wrap gap-2">
                            <form
                              className="flex gap-2"
                              onSubmit={(event) => {
                                event.preventDefault();
                                const value = new FormData(
                                  event.currentTarget,
                                ).get("newStart");
                                if (typeof value === "string" && value)
                                  void moveLesson(lesson, value);
                              }}
                            >
                              <Input
                                name="newStart"
                                type="datetime-local"
                                required
                                defaultValue={toLocalInputValue(
                                  new Date(lesson.startsAt),
                                )}
                                aria-label="Nouvel horaire"
                                className="w-auto"
                              />
                              <Button variant="outline" disabled={busy}>
                                Déplacer
                              </Button>
                            </form>
                            <Button
                              variant="ghost"
                              disabled={busy}
                              onClick={() => void cancelLesson(lesson)}
                            >
                              Annuler
                            </Button>
                            {new Date(lesson.endsAt).getTime() <=
                              Date.now() && (
                              <Button
                                disabled={busy}
                                onClick={() => void completeLesson(lesson)}
                              >
                                Terminer
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      {isTeacher && lesson.attendances.length > 0 && (
                        <div className="mt-4 border-t border-border pt-3">
                          <p className="mb-2 text-sm font-medium">Présences</p>
                          <div className="space-y-2">
                            {lesson.attendances.map((attendance) => (
                              <div
                                key={attendance.id}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                              >
                                <span>
                                  {attendance.studentUsername || "Élève"}
                                </span>
                                {lesson.status === "COMPLETED" ? (
                                  <select
                                    disabled={busy}
                                    value={attendance.status}
                                    onChange={(event) =>
                                      void setAttendance(
                                        lesson,
                                        attendance.enrollmentId,
                                        event.target.value as
                                          "PRESENT" | "ABSENT" | "EXCUSED",
                                      )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-2"
                                    aria-label={`Présence de ${attendance.studentUsername || "l’élève"}`}
                                  >
                                    <option value="EXPECTED" disabled>
                                      À renseigner
                                    </option>
                                    <option value="PRESENT">Présent</option>
                                    <option value="ABSENT">Absent</option>
                                    <option value="EXCUSED">Excusé</option>
                                  </select>
                                ) : (
                                  <span className="text-muted-foreground">
                                    En attente
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Mes demandes et invitations</h2>
            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucune demande ou invitation en cours.
              </p>
            ) : (
              <div className="grid gap-3">
                {enrollments.map((enrollment) => (
                  <article
                    key={enrollment.id}
                    className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}
                  >
                    <div>
                      <h3 className="font-medium">
                        {enrollment.courseTitle || "Cours de guitare"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Enseignant :{" "}
                        {enrollment.instructorUsername || "FlowFret"} ·{" "}
                        {enrollment.status}
                      </p>
                    </div>
                    {enrollment.status === "INVITED" && (
                      <div className="flex gap-2">
                        <Button
                          disabled={busy}
                          onClick={() =>
                            void answerInvitation(enrollment.id, true)
                          }
                        >
                          Accepter
                        </Button>
                        <Button
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            void answerInvitation(enrollment.id, false)
                          }
                        >
                          Refuser
                        </Button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-semibold">Mes cours</h2>
            {myCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun cours créé.</p>
            ) : (
              <div className="grid gap-3">
                {myCourses.map((course) => (
                  <article
                    key={course.id}
                    className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}
                  >
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatMoney(course.priceAmount, course.priceCurrency)}{" "}
                        par séance · {course.durationMinutes} min ·{" "}
                        {course.status}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={
                          busy ||
                          (profile?.status !== "APPROVED" &&
                            course.status !== "PUBLISHED")
                        }
                        onClick={() => void setPublished(course)}
                      >
                        {course.status === "PUBLISHED"
                          ? "Dépublier"
                          : "Publier"}
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void archive(course)}
                      >
                        Archiver
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Cours disponibles</h2>
            </div>
            {visibleCatalog.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun cours publié pour le moment.
              </p>
            ) : (
              <div className="grid gap-3">
                {visibleCatalog.map((course) => (
                  <article
                    key={course.id}
                    className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}
                  >
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.description || "Cours de guitare"} ·{" "}
                        {formatMoney(course.priceAmount, course.priceCurrency)}{" "}
                        · {course.durationMinutes} min
                      </p>
                    </div>
                    <Button
                      disabled={busy || myEnrollmentIds.has(course.id)}
                      onClick={() => void enroll(course)}
                    >
                      {myEnrollmentIds.has(course.id)
                        ? "Demande envoyée"
                        : "Demander une place"}
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        Votre compte FlowFret : {user?.username}. Les inscriptions actives sont
        confirmées par l’enseignant après accord de paiement.
      </p>
    </div>
  );
}

function currentTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function toLocalInputValue(date: Date) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

function formatLessonDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

function lessonInput(
  startsAt: string,
  teachingMode: "IN_PERSON" | "ONLINE",
  location: string,
  meetingUrl: string,
): TeachingLessonInput {
  return {
    startsAt: new Date(startsAt).toISOString(),
    timeZone: currentTimeZone(),
    teachingMode,
    location: teachingMode === "IN_PERSON" ? location : null,
    meetingUrl: teachingMode === "ONLINE" ? meetingUrl : null,
  };
}

function formatMoney(minorAmount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
  }).format(minorAmount / 100);
}
