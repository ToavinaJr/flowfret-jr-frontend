import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import type {
  TeachingCourse,
  TeachingEnrollment,
} from "@/services/teachingApi";
import { TeachingEnrollmentsPanel } from "./TeachingEnrollmentsPanel";

vi.mock("@/services/friendsApi", () => ({ searchUsers: vi.fn() }));

const course: TeachingCourse = {
  id: "course-1",
  instructorId: "profile-1",
  title: "Beginner guitar",
  description: null,
  level: "Beginner",
  format: "GROUP",
  maxStudents: 6,
  reservedSeats: 1,
  teachingMode: "ONLINE",
  priceAmount: 1000,
  priceCurrency: "EUR",
  priceUnit: "PER_LESSON",
  durationMinutes: 45,
  status: "PUBLISHED",
};

function enrollment(
  status: TeachingEnrollment["status"],
): TeachingEnrollment {
  return {
    id: `enrollment-${status}`,
    courseId: course.id,
    courseTitle: course.title,
    studentId: "student-1",
    studentUsername: "learner",
    instructorUsername: "teacher",
    status,
  };
}

function renderPanel({
  studentEnrollments = [],
  teacherEnrollments = [],
  onStatusChange,
}: {
  studentEnrollments?: TeachingEnrollment[];
  teacherEnrollments?: TeachingEnrollment[];
  onStatusChange?: (
    enrollment: TeachingEnrollment,
    status: TeachingEnrollment["status"],
  ) => Promise<void>;
}) {
  const statusChange =
    onStatusChange ?? vi.fn(async () => Promise.resolve());
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n.cloneInstance({ lng: "fr" })}>
        <MemoryRouter>
          <TeachingEnrollmentsPanel
            busy={false}
            courses={[course]}
            currentUserId="teacher-1"
            studentEnrollments={studentEnrollments}
            teacherEnrollments={teacherEnrollments}
            onInvitationResponse={vi.fn().mockResolvedValue(undefined)}
            onInvite={vi.fn().mockResolvedValue(undefined)}
            onStatusChange={statusChange}
          />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
  return { onStatusChange: statusChange };
}

describe("TeachingEnrollmentsPanel", () => {
  it("asks for confirmation before accepting a received request", async () => {
    const request = enrollment("REQUESTED");
    const { onStatusChange } = renderPanel({
      teacherEnrollments: [request],
    });

    fireEvent.click(screen.getByRole("button", { name: "Accepter l’élève" }));
    expect(
      screen.getByText(/Confirmer l’inscription de cet élève/),
    ).toBeInTheDocument();
    const approveButtons = screen.getAllByRole("button", {
      name: "Accepter l’élève",
    });
    fireEvent.click(approveButtons[approveButtons.length - 1]);

    await waitFor(() =>
      expect(onStatusChange).toHaveBeenCalledWith(request, "ACTIVE"),
    );
  });

  it("requires confirmation before a student leaves an active course", async () => {
    const active = enrollment("ACTIVE");
    const { onStatusChange } = renderPanel({
      studentEnrollments: [active],
    });

    fireEvent.click(screen.getByRole("button", { name: "Quitter le cours" }));
    expect(
      screen.getByText(/Voulez-vous vraiment quitter le cours/),
    ).toBeInTheDocument();
    const leaveButtons = screen.getAllByRole("button", {
      name: "Quitter le cours",
    });
    fireEvent.click(leaveButtons[leaveButtons.length - 1]);

    await waitFor(() =>
      expect(onStatusChange).toHaveBeenCalledWith(active, "CANCELLED"),
    );
  });
});
