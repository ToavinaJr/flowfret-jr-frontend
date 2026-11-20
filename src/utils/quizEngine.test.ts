import { describe, expect, it } from "vitest";
import { formatChordName, formatNoteName } from "@/utils/noteNaming";
import {
  chordPool,
  createRandom,
  generateQuiz,
  isAnswerCorrect,
  isPlacementCorrect,
  scoreQuiz,
  type PlacementRule,
  type QuizQuestion,
} from "@/utils/quizEngine";
import { transposeChordBySemitones } from "@/utils/chordTransposition";

const C_MAJOR: PlacementRule = { required: [0, 4, 7], allowed: [0, 4, 7] };

describe("quiz generation", () => {
  it("is reproducible for the same seed", () => {
    const first = generateQuiz({ kinds: ["identify", "transpose", "place"], difficulty: "advanced", random: createRandom(7) });
    const second = generateQuiz({ kinds: ["identify", "transpose", "place"], difficulty: "advanced", random: createRandom(7) });
    expect(second).toEqual(first);
  });

  it("returns the requested number of questions and nothing for an empty selection", () => {
    expect(generateQuiz({ kinds: ["identify"], difficulty: "basic", count: 6, random: createRandom(1) })).toHaveLength(6);
    expect(generateQuiz({ kinds: [], difficulty: "basic" })).toEqual([]);
  });

  it.each(["basic", "advanced"] as const)("gives every choice question four distinct options in %s mode", (difficulty) => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const questions = generateQuiz({ kinds: ["identify", "transpose"], difficulty, count: 10, random: createRandom(seed) });
      for (const question of questions) {
        if (question.kind === "place") continue;
        const labels = question.options.map((option) => `${option.key}|${option.suffix}`);
        expect(new Set(labels).size).toBe(4);
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(4);
      }
    }
  });

  it("never offers enharmonically identical chords as separate options", () => {
    // Caug, Eaug and Abaug contain the same notes, so at most one of them may appear in a question.
    const roots = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
    const questions = generateQuiz({ kinds: ["identify"], difficulty: "advanced", count: 300, random: createRandom(3) });
    for (const question of questions) {
      if (question.kind !== "identify") continue;
      const augSets = question.options
        .filter((option) => option.suffix === "aug")
        .map((option) => [0, 4, 8].map((interval) => (roots.indexOf(option.key) + interval) % 12).sort((x, y) => x - y).join(","));
      expect(new Set(augSets).size).toBe(augSets.length);
    }
  });

  it("computes the transposed answer from the chord library helper", () => {
    const questions = generateQuiz({ kinds: ["transpose"], difficulty: "basic", count: 30, random: createRandom(11) });
    for (const question of questions) {
      if (question.kind !== "transpose") continue;
      expect(question.subject).toBe("note");
      const expected = transposeChordBySemitones(question.source.key, question.semitones);
      expect(question.options[question.answerIndex].key).toBe(expected);
    }
  });

  it("keeps the chord quality when transposing chords", () => {
    const questions = generateQuiz({ kinds: ["transpose"], difficulty: "advanced", count: 30, random: createRandom(5) });
    for (const question of questions) {
      if (question.kind !== "transpose") continue;
      expect(question.subject).toBe("chord");
      expect(question.options[question.answerIndex].suffix).toBe(question.source.suffix);
    }
  });

  it("only asks to place chords that have a position within the board", () => {
    const questions = generateQuiz({ kinds: ["place"], difficulty: "advanced", count: 100, random: createRandom(9) });
    expect(questions.length).toBe(100);
    for (const question of questions) {
      expect(question.kind).toBe("place");
      if (question.kind === "place") expect(question.rule.required.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("never shows a library voicing that sounds like a different chord", () => {
    // The chord library has a Bbm7 voicing that actually sounds as Am7; it must be filtered out.
    const questions = generateQuiz({ kinds: ["identify"], difficulty: "advanced", count: 400, random: createRandom(21) });
    const minorSeventh = [0, 3, 7, 10];
    for (const question of questions) {
      if (question.kind !== "identify" || question.chord.suffix !== "m7") continue;
      const root = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"].indexOf(question.chord.key);
      const allowed = minorSeventh.map((interval) => (root + interval) % 12);
      for (const note of question.position.midi ?? []) expect(allowed).toContain(note % 12);
    }
  });

  it("builds a non-empty pool in both difficulties", () => {
    expect(chordPool("basic").length).toBe(24);
    expect(chordPool("advanced").length).toBeGreaterThan(chordPool("basic").length);
  });
});

describe("finger placement", () => {
  it("accepts the open C major shape", () => {
    expect(isPlacementCorrect([-1, 3, 2, 0, 1, 0], C_MAJOR)).toBe(true);
  });

  it("accepts other valid voicings of the same chord", () => {
    expect(isPlacementCorrect([-1, 3, 5, 5, 5, 3], C_MAJOR)).toBe(true); // C G C E G
    expect(isPlacementCorrect([0, 3, 2, 0, 1, 0], C_MAJOR)).toBe(true); // open low E is still a chord tone
  });

  it("rejects a shape with a note outside the chord", () => {
    expect(isPlacementCorrect([-1, 3, 2, 0, 2, 0], C_MAJOR)).toBe(false); // B string fret 2 is C#
  });

  it("rejects missing required tones, too few strings and out-of-board frets", () => {
    expect(isPlacementCorrect([-1, 3, -1, -1, -1, -1], C_MAJOR)).toBe(false);
    expect(isPlacementCorrect([-1, 3, 5, 5, -1, -1], C_MAJOR)).toBe(false); // C G C, no E
    expect(isPlacementCorrect([-1, 3, 2, 0, 1, 9], C_MAJOR)).toBe(false);
    expect(isPlacementCorrect([-1, 3, 2, 0, 1], C_MAJOR)).toBe(false);
  });

  it("scores answers by kind", () => {
    const choice: QuizQuestion = {
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
    };
    expect(isAnswerCorrect(choice, { kind: "choice", index: 0 })).toBe(true);
    expect(isAnswerCorrect(choice, { kind: "choice", index: 1 })).toBe(false);
    expect(isAnswerCorrect(choice, { kind: "frets", frets: [] })).toBe(false);
  });
});

describe("quiz helpers", () => {
  it("summarises a round", () => {
    expect(scoreQuiz([true, false, true, true])).toEqual({ correct: 3, total: 4, percent: 75 });
    expect(scoreQuiz([])).toEqual({ correct: 0, total: 0, percent: 0 });
  });

  it("formats names in solfège without changing the letter data", () => {
    expect(formatNoteName("D", "solfege")).toBe("Ré");
    expect(formatNoteName("Eb", "solfege")).toBe("Mib");
    expect(formatNoteName("C#", "solfege")).toBe("Do#");
    expect(formatChordName("Am", "solfege")).toBe("La m");
    expect(formatChordName("Cmaj7", "solfege")).toBe("Do maj7");
    expect(formatChordName("G", "solfege")).toBe("Sol");
    expect(formatChordName("Am", "letters")).toBe("Am");
  });
});
