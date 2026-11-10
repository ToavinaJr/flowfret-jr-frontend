export type MediaPanelRequest = "chords" | "youtube-video";

export const OPEN_MEDIA_PANEL_EVENT = "flowfret:open-media-panel";

export function requestMediaPanel(panel: MediaPanelRequest): void {
  window.dispatchEvent(
    new CustomEvent<MediaPanelRequest>(OPEN_MEDIA_PANEL_EVENT, {
      detail: panel,
    }),
  );
}
