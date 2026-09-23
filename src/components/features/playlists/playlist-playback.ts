import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { PlaylistTrack } from "@/types/playlist";

export function toPlaybackItem(track: PlaylistTrack): PlaybackItem {
  const subtitle = track.artists.map((artist) => artist.name).join(", ");
  if (track.provider === "SPOTIFY") {
    return {
      id: `${track.provider}:${track.providerTrackId}`,
      src: `spotify:track:${track.providerTrackId}`,
      engine: "spotify",
      title: track.title,
      subtitle,
      imageUrl: track.imageUrl,
      duration: track.durationMs / 1000,
      destination: "/playlists",
      provider: track.provider,
      album: track.album,
    };
  }
  if (track.provider === "YOUTUBE") {
    return {
      id: `${track.provider}:${track.providerTrackId}`,
      src: track.providerTrackId,
      engine: "youtube",
      title: track.title,
      subtitle,
      imageUrl: track.imageUrl,
      duration: track.durationMs / 1000,
      destination: "/playlists",
      provider: track.provider,
      album: track.album,
    };
  }
  return {
    id: `${track.provider}:${track.providerTrackId}`,
    src: `https://api.audius.co/v1/tracks/${encodeURIComponent(track.providerTrackId)}/stream`,
    engine: "audio",
    title: track.title,
    subtitle,
    imageUrl: track.imageUrl,
    duration: track.durationMs / 1000,
    destination: "/playlists",
    provider: track.provider,
    album: track.album,
  };
}
