import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PersonCard } from "@/components/friends/PersonCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { searchUsers } from "@/services/friendsApi";
import type {
  TeachingCourse,
  TeachingEnrollment,
} from "@/services/teachingApi";

type EnrollmentStatus = TeachingEnrollment["status"];

type Confirmation =
  | {
      kind: "status";
      enrollment: TeachingEnrollment;
      status: EnrollmentStatus;
      descriptionKey: string;
      actionKey: string;
    }
  | {
      kind: "invitation";
      enrollment: TeachingEnrollment;
      descriptionKey: string;
      actionKey: string;
    };

interface TeachingEnrollmentsPanelProps {
  busy: boolean;
  courses: TeachingCourse[];
  currentUserId?: string;
  studentEnrollments: TeachingEnrollment[];
  teacherEnrollments: TeachingEnrollment[];
  onInvitationResponse: (enrollmentId: string, accept: boolean) => Promise<void>;
  onInvite: (courseId: string, studentId: string) => Promise<void>;
  onStatusChange: (
    enrollment: TeachingEnrollment,
    status: EnrollmentStatus,
  ) => Promise<void>;
}

const cardClass = "rounded-xl border border-border bg-card p-4 sm:p-5";

export function TeachingEnrollmentsPanel({
  busy,
  courses,
  currentUserId,
  studentEnrollments,
  teacherEnrollments,
  onInvitationResponse,
  onInvite,
  onStatusChange,
}: TeachingEnrollmentsPanelProps) {
  const { t } = useTranslation();
  const publishedCourses = useMemo(
    () => courses.filter((course) => course.status === "PUBLISHED"),
    [courses],
  );
  const [selectedCourseId, setSelectedCourseId] = useState(
    publishedCourses[0]?.id ?? "",
  );
  const [query, setQuery] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  useEffect(() => {
    if (
      !selectedCourseId ||
      !publishedCourses.some((course) => course.id === selectedCourseId)
    ) {
      setSelectedCourseId(publishedCourses[0]?.id ?? "");
    }
  }, [publishedCourses, selectedCourseId]);

  const results = useQuery({
    queryKey: ["teaching-invite-search", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 60_000,
  });
  const selectedEnrollmentStudentIds = new Set(
    teacherEnrollments
      .filter(
        (enrollment) =>
          enrollment.courseId === selectedCourseId &&
          !["CANCELLED", "COMPLETED"].includes(enrollment.status),
      )
      .map((enrollment) => enrollment.studentId),
  );
  const matchingUsers = (results.data ?? []).filter(
    (person) => person.id !== currentUserId,
  );
  const statusLabel = (status: EnrollmentStatus) =>
    t(`teaching.status.${status.toLowerCase()}`, { defaultValue: status });

  async function confirmAction() {
    if (!confirmation) return;
    if (confirmation.kind === "invitation") {
      await onInvitationResponse(confirmation.enrollment.id, false);
    } else {
      await onStatusChange(confirmation.enrollment, confirmation.status);
    }
    setConfirmation(null);
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="student-enrollments-title">
        <h2 id="student-enrollments-title" className="mb-3 font-semibold">
          {t("teaching.fields.myRequestsAndInvitations")}
        </h2>
        {studentEnrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("teaching.empty.noRequests")}
          </p>
        ) : (
          <div className="grid gap-3">
            {studentEnrollments.map((enrollment) => (
              <article
                key={enrollment.id}
                className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}
              >
                <div className="min-w-0">
                  <h3 className="truncate font-medium">
                    {enrollment.courseTitle ||
                      t("teaching.fields.courseFallback")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("teaching.fields.instructorLabel")} {" "}
                    {enrollment.instructorUsername ||
                      t("teaching.fields.platformName")} {" "}
                    · {statusLabel(enrollment.status)}
                  </p>
                </div>
                {enrollment.status === "INVITED" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={busy}
                      onClick={() =>
                        void onInvitationResponse(enrollment.id, true)
                      }
                    >
                      {t("teaching.actions.acceptInvitation")}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        setConfirmation({
                          kind: "invitation",
                          enrollment,
                          descriptionKey:
                            "teaching.confirmation.declineInvitation",
                          actionKey: "teaching.actions.declineInvitation",
                        })
                      }
                    >
                      {t("teaching.actions.declineInvitation")}
                    </Button>
                  </div>
                ) : (
                  ["REQUESTED", "ACTIVE", "PAUSED"].includes(
                    enrollment.status,
                  ) && (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        setConfirmation({
                          kind: "status",
                          enrollment,
                          status: "CANCELLED",
                          descriptionKey:
                            enrollment.status === "REQUESTED"
                              ? "teaching.confirmation.cancelRequest"
                              : "teaching.confirmation.leaveCourse",
                          actionKey:
                            enrollment.status === "REQUESTED"
                              ? "teaching.actions.cancelRequest"
                              : "teaching.actions.leaveCourse",
                        })
                      }
                    >
                      {enrollment.status === "REQUESTED"
                        ? t("teaching.actions.cancelRequest")
                        : t("teaching.actions.leaveCourse")}
                    </Button>
                  )
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {courses.length > 0 && (
        <section aria-labelledby="teacher-enrollments-title">
          <h2 id="teacher-enrollments-title" className="mb-3 font-semibold">
            {t("teaching.fields.studentManagement")}
          </h2>
          {teacherEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("teaching.empty.noStudents")}
            </p>
          ) : (
            <div className="grid gap-3">
              {teacherEnrollments.map((enrollment) => (
                <TeacherEnrollmentCard
                  key={enrollment.id}
                  busy={busy}
                  enrollment={enrollment}
                  statusLabel={statusLabel}
                  onConfirm={setConfirmation}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {publishedCourses.length > 0 && (
        <section
          aria-labelledby="invite-student-title"
          className={cardClass}
        >
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 id="invite-student-title" className="font-semibold">
              {t("teaching.fields.inviteStudent")}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <label className="grid gap-1 text-sm font-medium">
              {t("teaching.fields.course")}
              <select
                className="h-10 min-w-0 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
              >
                {publishedCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium">
              {t("teaching.fields.searchStudent")}
              <span className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                  placeholder={t("teaching.fields.searchStudentPlaceholder")}
                />
              </span>
            </label>
          </div>
          <div className="mt-4" aria-live="polite">
            {query.trim().length < 2 ? (
              <p className="text-sm text-muted-foreground">
                {t("teaching.empty.searchStudentHint")}
              </p>
            ) : results.isFetching ? (
              <p className="text-sm text-muted-foreground">
                {t("teaching.feedback.searchingStudents")}
              </p>
            ) : results.isError ? (
              <p className="text-sm text-destructive">
                {t("teaching.feedback.studentSearchFailed")}
              </p>
            ) : matchingUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("teaching.empty.noStudentResults")}
              </p>
            ) : (
              <div className="grid gap-2 lg:grid-cols-2">
                {matchingUsers.map((person) => {
                  const alreadyAdded = selectedEnrollmentStudentIds.has(
                    person.id,
                  );
                  return (
                    <PersonCard
                      key={person.id}
                      person={person}
                      action={
                        <Button
                          size="sm"
                          disabled={busy || alreadyAdded}
                          onClick={() =>
                            void onInvite(selectedCourseId, person.id)
                          }
                        >
                          {alreadyAdded
                            ? t("teaching.actions.alreadyEnrolled")
                            : t("teaching.actions.invite")}
                        </Button>
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <AlertDialog
        open={confirmation !== null}
        onOpenChange={(open) => !open && !busy && setConfirmation(null)}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("teaching.confirmation.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation
                ? t(confirmation.descriptionKey, {
                    course:
                      confirmation.enrollment.courseTitle ||
                      t("teaching.fields.courseFallback"),
                  })
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              {t("teaching.actions.keepEnrollment")}
            </AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={() => void confirmAction()}>
              {confirmation ? t(confirmation.actionKey) : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function TeacherEnrollmentCard({
  busy,
  enrollment,
  statusLabel,
  onConfirm,
}: {
  busy: boolean;
  enrollment: TeachingEnrollment;
  statusLabel: (status: EnrollmentStatus) => string;
  onConfirm: (confirmation: Confirmation) => void;
}) {
  const { t } = useTranslation();
  const action = (
    status: EnrollmentStatus,
    actionKey: string,
    descriptionKey: string,
    variant: "default" | "outline" | "destructive" = "outline",
  ) => (
    <Button
      size="sm"
      variant={variant}
      disabled={busy}
      onClick={() =>
        onConfirm({
          kind: "status",
          enrollment,
          status,
          actionKey,
          descriptionKey,
        })
      }
    >
      {t(actionKey)}
    </Button>
  );

  return (
    <article
      className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}
    >
      <div className="min-w-0">
        <h3 className="truncate font-medium">
          {enrollment.studentUsername || t("teaching.fields.studentFallback")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {enrollment.courseTitle || t("teaching.fields.courseFallback")} ·{" "}
          {statusLabel(enrollment.status)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {enrollment.status === "REQUESTED" && (
          <>
            {action(
              "ACTIVE",
              "teaching.actions.approveEnrollment",
              "teaching.confirmation.approveEnrollment",
              "default",
            )}
            {action(
              "CANCELLED",
              "teaching.actions.declineRequest",
              "teaching.confirmation.declineRequest",
            )}
          </>
        )}
        {enrollment.status === "INVITED" &&
          action(
            "CANCELLED",
            "teaching.actions.cancelInvitation",
            "teaching.confirmation.cancelInvitation",
          )}
        {enrollment.status === "ACTIVE" && (
          <>
            {action(
              "PAUSED",
              "teaching.actions.pauseEnrollment",
              "teaching.confirmation.pauseEnrollment",
            )}
            {action(
              "COMPLETED",
              "teaching.actions.completeEnrollment",
              "teaching.confirmation.completeEnrollment",
            )}
            {action(
              "CANCELLED",
              "teaching.actions.removeStudent",
              "teaching.confirmation.removeStudent",
              "destructive",
            )}
          </>
        )}
        {enrollment.status === "PAUSED" && (
          <>
            {action(
              "ACTIVE",
              "teaching.actions.resumeEnrollment",
              "teaching.confirmation.resumeEnrollment",
              "default",
            )}
            {action(
              "COMPLETED",
              "teaching.actions.completeEnrollment",
              "teaching.confirmation.completeEnrollment",
            )}
            {action(
              "CANCELLED",
              "teaching.actions.removeStudent",
              "teaching.confirmation.removeStudent",
              "destructive",
            )}
          </>
        )}
      </div>
    </article>
  );
}
