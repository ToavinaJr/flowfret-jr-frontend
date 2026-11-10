// FlowFret launch film. Chord names, categories, string tuning, fret positions and voicing counts
// are copied from src/data/guitar/guitar.json in the FlowFret frontend; no API result is implied.
import { IDENTITY } from './brand/identity';
import type { IconName } from './kit/icons';

export const WALK = {
  name: IDENTITY.name,
  lines: {
    promise: 'FlowFret turns [] into practice.',
    claim: 'FlowFret shows four C voicings.',
    step1: 'Search the chord library.',
    insight: 'Find a shape to play.',
    pick: 'Choose a voicing and strum.',
    payoff: 'Try it with FlowFret.',
  },
  keys: {
    promise: 'practice',
    claim: 'shows four C voicings',
    step1: 'chord library',
    insight: 'shape to play',
    pick: 'choose a voicing and strum',
    payoff: 'try it with FlowFret',
  } as Record<string, string>,
  input: {
    title: 'C major',
    handle: 'Chord Explorer',
    stats: ['Key C', 'Major'],
    source: '',
    sourceName: 'songs',
  },
  claimObject: 'music',
  output: {
    title: 'C major',
    sub: 'Chord Explorer',
    steps: ['Search chords', 'Choose a voicing', 'Strum the shape'],
  },
  proof: [
    { title: 'C major', body: 'Four voicings', meta: 'Chord Explorer', glyph: 'music' },
    { title: 'C minor', body: 'Four voicings', meta: 'Chord Explorer', glyph: 'music' },
    { title: 'C7', body: 'Four voicings', meta: 'Chord Explorer', glyph: 'music' },
    { title: 'Cmaj7', body: 'Four voicings', meta: 'Chord Explorer', glyph: 'music' },
    { title: 'Csus4', body: 'Four voicings', meta: 'Chord Explorer', glyph: 'music' },
  ] as { title: string; body: string; meta: string; glyph?: IconName }[],
  field: {
    placeholder: 'Search chords',
    value: 'C',
    action: 'Search',
    busy: 'Searching',
  },
  results: [
    { title: 'C', meta: 'Major', badge: '4 voicings' },
    { title: 'Cm', meta: 'Minor', badge: '4 voicings' },
    { title: 'C7', meta: '7th', badge: '4 voicings' },
    { title: 'Cmaj7', meta: '7th', badge: '4 voicings' },
    { title: 'Csus4', meta: 'Other', badge: '4 voicings' },
  ],
  feed: {
    label: 'Chord results',
    unit: 'chords',
    total: '5',
    key: 0,
    rows: [
      { who: 'C', initials: 'C', text: 'Major · 4 voicings' },
      { who: 'Cm', initials: 'Cm', text: 'Minor · 4 voicings' },
      { who: 'C7', initials: 'C7', text: '7th · 4 voicings' },
      { who: 'Cmaj7', initials: 'C', text: '7th · 4 voicings' },
      { who: 'Csus4', initials: 'Cs', text: 'Other · 4 voicings' },
    ],
  },
  insight: { text: 'C major', count: '4 voicings' },
  options: [
    { title: 'Open position', meta: 'C major', value: 'Voicing 1/4', glyph: 'music' },
    { title: '3rd position', meta: 'C major', value: 'Voicing 2/4', glyph: 'music' },
    { title: '5th position', meta: 'C major', value: 'Voicing 3/4', glyph: 'music' },
    { title: '8th position', meta: 'C major', value: 'Voicing 4/4', glyph: 'music' },
  ] as { title: string; meta: string; value: string; glyph?: IconName }[],
  pick: 0,
  build: { label: 'C major chord shape' },
  page: {
    headline: 'C major',
    sub: 'Chord Explorer',
    cta: 'Strum',
    rows: ['E2 · muted', 'A2 · fret 3', 'D3 · fret 2', 'G3 · open', 'B3 · fret 1', 'E4 · open'],
  },
  photos: { people: [] as string[], results: [] as string[], input: '' },
} as const;

/** An inline source mark is intentionally omitted; the source is the user's song, not a provider endorsement. */
export const spoken = (s: string, object = ''): string => s.replace(/\s*\[\]\s*/g, object ? ` ${object} ` : ' ').replace(/\s+/g, ' ').trim();
export const PROMISE = spoken(WALK.lines.promise, WALK.input.sourceName);
export const CLAIM = spoken(WALK.lines.claim);
export const withSlot = (s: string): string => (s.includes('[]') ? s : `[] ${s}`);

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
for (const [k, raw] of Object.entries(WALK.lines)) {
  const s = k === 'promise' ? PROMISE : spoken(raw);
  if (words(s) < 2 || words(s) > 7) throw new Error(`walk.ts: line "${k}" ("${s}") is ${words(s)} words; a line is one short sentence of 2-7 words`);
}
if (WALK.feed.key >= WALK.feed.rows.length) throw new Error('walk.ts: feed.key must name one of the feed rows');
if (WALK.pick >= WALK.options.length) throw new Error('walk.ts: WALK.pick must name one of the options');


