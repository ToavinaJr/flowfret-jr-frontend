import type { Chord, ChordPosition, GuitarDB, GuitarMain } from "@/types/chord";

function isRecord(value: object): value is Record<string, object | string | number | boolean | null | Array<object | string | number | boolean | null>> {
  return !Array.isArray(value);
}

function isNumberArray(value: object | string | number | boolean | null | Array<object | string | number | boolean | null>): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

function isStringArray(value: object | string | number | boolean | null | Array<object | string | number | boolean | null>): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isChordPosition(value: object | string | number | boolean | null): value is ChordPosition {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, object | string | number | boolean | null | Array<object | string | number | boolean | null>>;
  return (
    isNumberArray(record.frets) &&
    isNumberArray(record.fingers) &&
    typeof record.baseFret === "number" &&
    isNumberArray(record.barres)
  );
}

function isChord(value: object | string | number | boolean | null): value is Chord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, object | string | number | boolean | null | Array<object | string | number | boolean | null>>;
  return (
    typeof record.key === "string" &&
    typeof record.suffix === "string" &&
    Array.isArray(record.positions) &&
    record.positions.every((pos) => isChordPosition(pos))
  );
}

function isGuitarMain(value: object | string | number | boolean | null | Array<object | string | number | boolean | null>): value is GuitarMain {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, object | string | number | boolean | null | Array<object | string | number | boolean | null>>;
  return (
    typeof record.strings === "number" &&
    typeof record.fretsOnChord === "number" &&
    typeof record.name === "string"
  );
}

/**
 * Runtime validation for the bundled guitar chord database.
 * Avoids permissive casts while keeping a strict GuitarDB return type.
 */
export function parseGuitarDB(raw: object): GuitarDB {
  if (!isRecord(raw)) {
    throw new Error("Invalid guitar database: expected object");
  }

  if (!isGuitarMain(raw.main)) {
    throw new Error("Invalid guitar database: main");
  }

  if (typeof raw.tunings !== "object" || raw.tunings === null || Array.isArray(raw.tunings)) {
    throw new Error("Invalid guitar database: tunings");
  }

  const tuningsRecord = raw.tunings as Record<string, object | string | number | boolean | null | Array<object | string | number | boolean | null>>;
  if (!isStringArray(tuningsRecord.standard)) {
    throw new Error("Invalid guitar database: tunings.standard");
  }

  if (!isStringArray(raw.keys) || !isStringArray(raw.suffixes)) {
    throw new Error("Invalid guitar database: keys/suffixes");
  }

  if (typeof raw.chords !== "object" || raw.chords === null || Array.isArray(raw.chords)) {
    throw new Error("Invalid guitar database: chords");
  }

  const chordsRecord = raw.chords as Record<string, object | string | number | boolean | null | Array<object | string | number | boolean | null>>;
  const chords: Record<string, Chord[]> = {};

  for (const [key, value] of Object.entries(chordsRecord)) {
    if (!Array.isArray(value)) {
      throw new Error(`Invalid guitar database: chords.${key}`);
    }
    const chordList: Chord[] = [];
    for (const item of value) {
      if (!isChord(item)) {
        throw new Error(`Invalid guitar database: chords.${key}`);
      }
      chordList.push(item);
    }
    chords[key] = chordList;
  }

  const tunings: GuitarDB["tunings"] = { standard: tuningsRecord.standard };
  for (const [name, value] of Object.entries(tuningsRecord)) {
    if (name === "standard") continue;
    if (isStringArray(value)) {
      tunings[name] = value;
    }
  }

  return {
    main: raw.main,
    tunings,
    keys: raw.keys,
    suffixes: raw.suffixes,
    chords,
  };
}
