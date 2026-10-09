import { useContext } from "react";
import {
  PlaybackContext,
  type PlaybackContextValue,
} from "./playback-context";

export function usePlayback(): PlaybackContextValue {
  const context = useContext(PlaybackContext);
  if (!context)
    throw new Error("usePlayback must be used inside PlaybackProvider");
  return context;
}
