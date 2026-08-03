import { useState } from "react";
import { KEYS, SCALES, isScaleId } from "@/constants/scalesConstants";
import type { ScaleId, ScaleKey } from "@/types/scales";

export function useScaleSelection() {
  const [selectedKey, setSelectedKey] = useState<ScaleKey>(KEYS[9]);
  const [selectedScale, setSelectedScale] = useState<ScaleId>("pentatonicMin");

  const changeKey = (key: ScaleKey) => {
    setSelectedKey(key);
  };

  const changeScale = (scale: string) => {
    if (isScaleId(scale)) {
      setSelectedScale(scale);
    }
  };

  return {
    selectedKey,
    selectedScale,
    changeKey,
    changeScale,
    availableKeys: KEYS,
    availableScales: Object.keys(SCALES) as ScaleId[],
  };
}
