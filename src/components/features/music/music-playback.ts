import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { MUSIC_PROVIDER } from "@/constants/domain";
import type { MusicTrack } from "@/types/music";

export function toMusicPlaybackItem(track: MusicTrack): PlaybackItem {
  const subtitle = track.artists.map((artist) => artist.name).join(", ");
  const common = {
    id: `${track.provider.toLowerCase()}:${track.providerTrackId}`,
    title: track.title,
    subtitle,
    imageUrl: track.imageUrl,
    duration: track.durationMs / 1000,
    destination: "/music",
    provider: track.provider,
    providerTrackId: track.providerTrackId,
    artists: track.artists,
    externalUrl: track.externalUrl,
    streamUrl: track.streamUrl,
    genre: track.genre,
    isrc: track.isrc,
    artist: track.artists[0]?.name ?? "",
    album: track.album,
  };
  if (track.provider === MUSIC_PROVIDER.SPOTIFY)
    return {
      ...common,
      engine: "spotify",
      src: `spotify:track:${track.providerTrackId}`,
    };
  if (track.provider === MUSIC_PROVIDER.YOUTUBE)
    return { ...common, engine: "youtube", src: track.providerTrackId };
  return { ...common, engine: "audio", src: track.streamUrl };
}
