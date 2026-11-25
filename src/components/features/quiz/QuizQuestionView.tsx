import { useState } from "react";
import type { TFunction } from "i18next";
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import { FretboardInput } from "@/components/features/quiz/FretboardInput";
import { Button } from "@/components/ui/button";
import { QUIZ_MUTED as MUTED, QUIZ_STRING_COUNT as STRING_COUNT, soundingStringCount, type QuizAnswer, type LearnerQuestion, type ChordRef } from "@/services/quizzesApi";
import { formatChordLabel } from "@/utils/chords";
import { formatChordName, formatNoteName, type NotationStyle } from "@/utils/noteNaming";

interface QuizFeedback {
  correct: boolean;
  answer: QuizAnswer;
  correctOption?: { key: string; suffix: string };
  example?: { frets: number[]; fingers: number[]; baseFret: number; barres: number[] };
}

const MIN_STRINGS_TO_SUBMIT = 3;
const EMPTY_BOARD: readonly number[] = Array.from({ length: STRING_COUNT }, () => MUTED);

interface QuizQuestionViewProps {
  question: LearnerQuestion;
  notation: NotationStyle;
  feedback: QuizFeedback | null;
  isLast: boolean;
  isSubmitting: boolean;
  onSubmit: (answer: QuizAnswer) => void;
  onNext: () => void;
}

function chordName(ref: ChordRef, notation: NotationStyle): string {
  return formatChordName(formatChordLabel(ref.key, ref.suffix), notation);
}

function optionName(question: LearnerQuestion, ref: ChordRef, notation: NotationStyle): string {
  return question.kind === "transpose" && question.subject === "note"
    ? formatNoteName(ref.key, notation)
    : chordName(ref, notation);
}

export function QuizQuestionView({ question, notation, feedback, isLast, isSubmitting, onSubmit, onNext }: QuizQuestionViewProps) {
  const { t } = useTranslation();
  const [frets, setFrets] = useState<readonly number[]>(EMPTY_BOARD);
  const answered = feedback !== null;

  return (
    <section aria-labelledby="quiz-prompt" className="space-y-4">
      <h2 id="quiz-prompt" className="text-base font-semibold text-foreground sm:text-lg">
        {promptText(question, notation, t)}
      </h2>

      {question.kind === "identify" && (
        <div className="flex justify-center">
          <ChordDiagram chord="" position={question.position} />
        </div>
      )}

      {question.kind !== "place" ? (
        <ul className="grid gap-2 sm:grid-cols-2" aria-label={t("quiz.options")}>
          {question.options.map((option, index) => {
            const isAnswer = feedback?.correctOption?.key === option.key && feedback.correctOption.suffix === option.suffix;
            const chosen = feedback?.answer.kind === "choice" && feedback.answer.index === index;
            const tone = !answered
              ? "border-border bg-card hover:border-primary/60"
              : isAnswer
                ? "border-green-600 bg-green-600/10"
                : chosen
                  ? "border-destructive bg-destructive/10"
                  : "border-border bg-card opacity-70";
            return (
              <li key={`${option.key}|${option.suffix}`}>
                <button
                  type="button"
                  disabled={answered || isSubmitting}
                  onClick={() => onSubmit({ kind: "choice", index })}
                  className={`flex min-h-12 w-full items-center justify-between gap-2 rounded-lg border px-4 py-2 text-left text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-default ${tone}`}
                >
                  <span>{optionName(question, option, notation)}</span>
                  {answered && isAnswer && <Check className="h-4 w-4 text-green-600" aria-hidden="true" />}
                  {answered && chosen && !isAnswer && <X className="h-4 w-4 text-destructive" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("quiz.fretboard.hint")}</p>
          <FretboardInput value={frets} notation={notation} disabled={answered || isSubmitting} onChange={setFrets} />
          {!answered && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" variant="secondary" className="min-h-11" disabled={isSubmitting} onClick={() => setFrets(EMPTY_BOARD)}>
                {t("quiz.fretboard.clear")}
              </Button>
              <Button
                type="button"
                className="min-h-11"
                disabled={isSubmitting || soundingStringCount(frets) < MIN_STRINGS_TO_SUBMIT}
                onClick={() => onSubmit({ kind: "frets", frets: [...frets] })}
              >
                {t("quiz.validate")}
              </Button>
              {soundingStringCount(frets) < MIN_STRINGS_TO_SUBMIT && (
                <p className="w-full text-center text-xs text-muted-foreground">{t("quiz.fretboard.minStrings")}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div role="status" aria-live="polite" className="space-y-3">
        {feedback && (
          <FeedbackPanel question={question} feedback={feedback} notation={notation} />
        )}
      </div>

      {answered && (
        <div className="flex justify-end">
          <Button type="button" className="min-h-11" onClick={onNext} autoFocus>
            {t(isLast ? "quiz.seeResult" : "quiz.next")}
          </Button>
        </div>
      )}
    </section>
  );
}

function FeedbackPanel({
  question,
  feedback,
  notation,
}: {
  question: LearnerQuestion;
  feedback: QuizFeedback;
  notation: NotationStyle;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={`rounded-lg border p-3 text-sm ${
        feedback.correct ? "border-green-600 bg-green-600/10" : "border-destructive bg-destructive/10"
      }`}
    >
      <p className="font-medium text-foreground">{t(feedback.correct ? "quiz.feedback.correct" : "quiz.feedback.wrong")}</p>
      {!feedback.correct && question.kind !== "place" && feedback.correctOption && (
        <p className="mt-1 text-muted-foreground">
          {t("quiz.feedback.answerWas", { answer: optionName(question, feedback.correctOption, notation) })}
        </p>
      )}
      {!feedback.correct && question.kind === "place" && feedback.example && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <p className="text-muted-foreground">
            {t("quiz.feedback.example", { name: chordName(question.chord, notation) })}
          </p>
          <ChordDiagram chord={chordName(question.chord, notation)} position={feedback.example} scale={0.8} />
        </div>
      )}
    </div>
  );
}

function promptText(
  question: LearnerQuestion,
  notation: NotationStyle,
  t: TFunction,
): string {
  if (question.kind === "identify") return t("quiz.prompt.identify");
  if (question.kind === "place") return t("quiz.prompt.place", { name: chordName(question.chord, notation) });
  const name = optionName(question, question.source, notation);
  const count = Math.abs(question.semitones);
  return t(question.semitones > 0 ? "quiz.prompt.transposeUp" : "quiz.prompt.transposeDown", { name, count });
}
