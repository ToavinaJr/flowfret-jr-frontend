export interface SpotifyPlaybackEvent {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    duration: number;
    position: number;
  };
}

export interface SpotifyEmbedController {
  loadEntity: (uri: string) => void;
  play: () => void;
  resume: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (
    event: string,
    listener: (event: SpotifyPlaybackEvent) => void,
  ) => void;
}

export interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: number; height: number },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

let spotifyApiPromise: Promise<SpotifyIframeApi> | null = null;

export function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (spotifyApiPromise) return spotifyApiPromise;
  spotifyApiPromise = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve;
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-spotify-iframe-api]",
    );
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.dataset.spotifyIframeApi = "true";
    script.onerror = () => reject(new Error("Unable to load Spotify player"));
    document.body.appendChild(script);
  });
  return spotifyApiPromise;
}