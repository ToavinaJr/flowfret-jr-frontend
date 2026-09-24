import { describe, expect, it } from 'vitest';
import type { PlaylistTrack } from '@/types/playlist';
import { toPlaybackItem } from './playlist-playback';

const baseTrack: PlaylistTrack = {
  id: 'catalog-1',
  provider: 'AUDIUS',
  providerTrackId: 'provider-1',
  title: 'Song',
  artists: [{ id: 'artist-1', name: 'Artist' }],
  album: 'Album',
  genre: 'Rock',
  imageUrl: null,
  externalUrl: 'https://example.test/song',
  durationMs: 123_000,
  isrc: null,
};

describe('toPlaybackItem', () => {
  it.each([
    ['AUDIUS', 'audio', 'https://api.audius.co/v1/tracks/provider-1/stream'],
    ['SPOTIFY', 'spotify', 'spotify:track:provider-1'],
    ['YOUTUBE', 'youtube', 'provider-1'],
  ] as const)('maps %s tracks to the correct playback engine', (provider, engine, src) => {
    const item = toPlaybackItem({ ...baseTrack, provider });

    expect(item).toMatchObject({
      id: `${provider}:provider-1`,
      engine,
      src,
      title: 'Song',
      artist: 'Artist',
      duration: 123,
    });
  });
});
