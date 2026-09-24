import { useEffect, useRef } from "react";
import {
  writePlaybackSession,
  type PlaybackSession,
} from "@/services/playbackSession";

export function usePlaybackPersistence(session: PlaybackSession) {
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    const persist = () => writePlaybackSession(sessionRef.current);
    const interval = window.setInterval(persist, 2_000);
    window.addEventListener("pagehide", persist);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", persist);
      persist();
    };
  }, []);

  useEffect(() => {
    writePlaybackSession(sessionRef.current);
  }, [session.item, session.currentIndex, session.queue, session.shuffle]);

  return sessionRef;
}
