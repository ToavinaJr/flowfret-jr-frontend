import { useCallback, useEffect, useRef, type RefObject } from "react";
import {
  loadSpotifyIframeApi,
  type SpotifyEmbedController,
} from "@/services/spotifyIframe";
import type { PlayState } from "@/types/song";

interface SpotifyControllerOptions {
  setPlayState: (state: PlayState) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

export function useSpotifyController({
  setPlayState,
  setCurrentTime,
  setDuration,
}: SpotifyControllerOptions) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const pendingRef = useRef<Promise<SpotifyEmbedController> | null>(null);
  const uriRef = useRef<string | null>(null);
  const generationRef = useRef(0);

  const getController = useCallback(
    async (uri: string) => {
      if (controllerRef.current) {
        if (uriRef.current !== uri) {
          controllerRef.current.loadEntity(uri);
          uriRef.current = uri;
        }
        return controllerRef.current;
      }
      if (pendingRef.current) return pendingRef.current;
      const generation = generationRef.current;
      pendingRef.current = loadSpotifyIframeApi()
        .then(
          (api) =>
            new Promise<SpotifyEmbedController>((resolve, reject) => {
              if (!hostRef.current)
                throw new Error("Spotify player host is unavailable");
              api.createController(
                hostRef.current,
                { uri, width: 300, height: 80 },
                (controller) => {
                  if (generation !== generationRef.current) {
                    controller.destroy();
                    reject(new Error("Spotify player initialization cancelled"));
                    return;
                  }
                  controllerRef.current = controller;
                  uriRef.current = uri;
                  controller.addListener("playback_started", () =>
                    setPlayState("playing"),
                  );
                  controller.addListener("playback_update", (event) => {
                    setCurrentTime(event.data.position / 1000);
                    setDuration(event.data.duration / 1000);
                    setPlayState(
                      event.data.isBuffering
                        ? "loading"
                        : event.data.isPaused
                          ? "paused"
                          : "playing",
                    );
                  });
                  resolve(controller);
                },
              );
            }),
        )
        .catch((error: unknown) => {
          pendingRef.current = null;
          throw error;
        });
      return pendingRef.current;
    },
    [setCurrentTime, setDuration, setPlayState],
  );

  const reset = useCallback(() => {
    generationRef.current += 1;
    controllerRef.current?.destroy();
    controllerRef.current = null;
    pendingRef.current = null;
    uriRef.current = null;
  }, []);

  useEffect(() => reset, [reset]);

  return {
    hostRef: hostRef as RefObject<HTMLDivElement>,
    uriRef,
    getController,
    pause: () => controllerRef.current?.pause(),
    seek: (time: number) => controllerRef.current?.seek(time),
    reset,
  };
}
