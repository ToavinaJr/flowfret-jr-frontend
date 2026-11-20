import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotationProvider } from "@/contexts/NotationContext";
import { getChordPositions } from "@/utils/chords";
import type { QuizQuestion } from "@/utils/quizEngine";
import QuizPage from "./QuizPage";

const questions = vi.hoisted(() => ({ current: [] as QuizQuestion[] }));

vi.mock("@/utils/quizEngine", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/utils/quizEngine")>()),
  generateQuiz: () => questions.current,
}));

function buildQuestions(): QuizQuestion[] {
  return [
    {
      id: "q1",
      kind: "transpose",
      subject: "note",
      source: { key: "D", suffix: "major" },
      semitones: 2,
      options: [
        { key: "E", suffix: "major" },
        { key: "F", suffix: "major" },
        { key: "C", suffix: "major" },
        { key: "D", suffix: "major" },
      ],
      answerIndex: 0,
    },
    {
      id: "q2",
      kind: "place",
      chord: { key: "C", suffix: "major" },
      rule: { required: [0, 4, 7], allowed: [0, 4, 7] },
      example: getChordPositions("C", "major")[0],
    },
  ];
}

function renderPage() {
  return render(
    <NotationProvider>
      <QuizPage />
    </NotationProvider>,
  );
}

function placeOpenC() {
  fireEvent.click(screen.getByRole("button", { name: "String 5 (A), fret 3" }));
  fireEvent.click(screen.getByRole("button", { name: "String 4 (D), fret 2" }));
  fireEvent.click(screen.getByRole("button", { name: "String 3 (G), open" }));
  fireEvent.click(screen.getByRole("button", { name: "String 2 (B), fret 1" }));
  fireEvent.click(screen.getByRole("button", { name: "String 1 (E), open" }));
}

describe("QuizPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    questions.current = buildQuestions();
  });

  it("plays a round, scores it and stores the best result", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Start quiz" }));
    expect(screen.getByRole("heading", { name: "What is D transposed up by 2 semitones?" })).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "E" }));
    expect(screen.getByText("Correct!")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));

    expect(screen.getByRole("heading", { name: "Place your fingers for the C chord" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check" })).toBeDisabled();
    placeOpenC();
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText("Correct!")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "See results" }));
    expect(screen.getByTestId("quiz-score")).toHaveTextContent("2 / 2");
    expect(screen.getByText("New personal best!")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("flowfret.quiz-progress.v1") ?? "{}")).toEqual({
      basic: { correct: 2, total: 2, percent: 100 },
    });
  });

  it("shows the correct answer and an example fingering after a mistake", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Start quiz" }));

    fireEvent.click(screen.getByRole("button", { name: "F" }));
    expect(screen.getByText("That's not the right answer.")).toBeInTheDocument();
    expect(screen.getByText("The correct answer was: E")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));

    fireEvent.click(screen.getByRole("button", { name: "String 5 (A), fret 3" }));
    fireEvent.click(screen.getByRole("button", { name: "String 4 (D), fret 5" }));
    fireEvent.click(screen.getByRole("button", { name: "String 3 (G), open" }));
    fireEvent.click(screen.getByRole("button", { name: "Check" }));
    // C and G only, the E is missing: the board is locked and an example is offered.
    expect(screen.getByText("That's not the right answer.")).toBeInTheDocument();
    expect(screen.getByText("Here is an example fingering for C:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "String 5 (A), fret 3" })).toBeDisabled();
  });

  it("lets a finger be removed by pressing the same cell again", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Start quiz" }));
    fireEvent.click(screen.getByRole("button", { name: "F" }));
    fireEvent.click(screen.getByRole("button", { name: "Next question" }));

    const cell = screen.getByRole("button", { name: "String 5 (A), fret 3" });
    fireEvent.click(cell);
    expect(cell).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(cell);
    expect(cell).toHaveAttribute("aria-pressed", "false");
  });

  it("displays notes in solfège when selected in the settings", () => {
    window.localStorage.setItem("flowfret.notation.v1", "solfege");
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Start quiz" }));

    expect(screen.getByRole("heading", { name: "What is Ré transposed up by 2 semitones?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mi" })).toBeInTheDocument();
  });

  it("requires at least one question type", () => {
    renderPage();
    for (const title of ["Recognise the chord", "Transpose", "Place your fingers"]) {
      fireEvent.click(screen.getByRole("checkbox", { name: new RegExp(title) }));
    }
    expect(screen.getByRole("button", { name: "Start quiz" })).toBeDisabled();
    expect(screen.getByText("Select at least one question type.")).toBeInTheDocument();
  });
});
