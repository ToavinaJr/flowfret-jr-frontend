import { useMemo } from "react";
import { NOTE_DISPLAY, SCALES } from "@/constants/scalesConstants";
import type { ScaleId, ScaleKey } from "@/types/scales";

interface UseScaleNotesProps {
  selectedKey: ScaleKey;
  selectedScale: ScaleId;
}

export function useScaleNotes({ selectedKey, selectedScale }: UseScaleNotesProps) {
  return useMemo(() => {
    const scale = SCALES[selectedScale] ?? SCALES.pentatonicMin;
    const scaleNotes = scale.intervals.map(
      (i) => NOTE_DISPLAY[(selectedKey.index + i) % 12],
    );
    return { scale, scaleNotes };
  }, [selectedKey.index, selectedScale]);
}
