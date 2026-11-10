import React from 'react';
import { Img, staticFile } from 'remotion';
import { C, U } from '../brand/tokens';

// Open-position C-major voicing 1 from src/data/guitar/guitar.json.
const fret = [-1, 3, 2, 0, 1, 0] as const;
const strings = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

/** A motion-ready reconstruction of FlowFret's real Chord Explorer, using its bundled C-major voicing. */
export const ChordExplorer: React.FC<{ frame: number; compact?: boolean }> = ({ frame, compact = false }) => {
  const s = U * (compact ? 0.58 : 1);
  const enter = Math.max(0, Math.min(1, (frame + 1) / 32));
  const dot = (i: number) => ({
    x: (126 + i * 100) * s,
    y: (fret[i] === 0 ? 332 : 296 - (fret[i] - 1) * 43) * s,
  });
  return (
    <div data-ui style={{ position: 'absolute', inset: 0, background: C.ink, color: C.paper, borderRadius: 24 * s, overflow: 'hidden', fontFamily: 'Inter, sans-serif', opacity: enter }}>
      <div style={{ height: 72 * s, display: 'flex', alignItems: 'center', gap: 20 * s, padding: `0 ${28 * s}px`, borderBottom: `${1 * s}px solid ${C.line}` }}>
        <Img src={staticFile('assets/flowfret-logo.svg')} style={{ width: 30 * s, height: 30 * s, objectFit: 'contain' }} />
        <span style={{ fontSize: 20 * s, fontWeight: 650 }}>FlowFret</span>
        <span style={{ marginLeft: 'auto', color: '#B8B8B8', fontSize: 15 * s }}>Chord Explorer</span>
      </div>
      <div style={{ padding: `${25 * s}px ${28 * s}px` }}>
        <div style={{ fontSize: 30 * s, fontWeight: 650, letterSpacing: -0.6 * s }}>Chord Explorer</div>
        <div style={{ marginTop: 16 * s, height: 48 * s, borderRadius: 10 * s, background: '#1A1A1A', border: `${1 * s}px solid #363636`, display: 'flex', alignItems: 'center', padding: `0 ${14 * s}px`, color: '#929292', fontSize: 15 * s }}>
          Search chords… (Am, Cmaj7, F#dim)
        </div>
        <div style={{ display: 'flex', gap: 9 * s, marginTop: 16 * s }}>
          {['All', 'Major', 'Minor', '7th'].map((x, i) => <span key={x} style={{ padding: `${7 * s}px ${13 * s}px`, borderRadius: 20 * s, color: i === 1 ? '#fff' : '#A6A6A6', background: i === 1 ? C.accent : '#202020', fontSize: 13 * s }}>{x}</span>)}
        </div>
        <div style={{ marginTop: 22 * s, display: 'flex', gap: 25 * s }}>
          <div style={{ flex: 1, borderRadius: 16 * s, background: '#1A1A1A', border: `${1 * s}px solid #363636`, padding: `${22 * s}px` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 * s }}><b style={{ fontSize: 44 * s }}>C</b><span style={{ color: '#A7A7A7', fontSize: 16 * s }}>C major</span><span style={{ marginLeft: 'auto', color: '#C8C8C8', fontSize: 13 * s }}>Voicing 1/4</span></div>
            <div style={{ position: 'relative', width: 650 * s, height: 388 * s, margin: `${16 * s}px auto 0`, maxWidth: '100%' }}>
              {strings.map((str: string, i: number) => <React.Fragment key={str}>
                <div style={{ position: 'absolute', left: (126 + i * 100) * s, top: 44 * s, width: 1.5 * s, height: 302 * s, background: '#A8A8A8' }} />
                <span style={{ position: 'absolute', left: (96 + i * 100) * s, top: 0, width: 62 * s, textAlign: 'center', color: '#B8B8B8', fontSize: 12 * s }}>{str}</span>
              </React.Fragment>)}
              {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ position: 'absolute', top: (44 + i * 74) * s, left: 126 * s, width: 500 * s, height: (i === 0 ? 5 : 1.5) * s, background: i === 0 ? '#E8E8E8' : '#656565' }} />)}
              {fret.map((n: number, i: number) => n > 0 && <div key={i} style={{ position: 'absolute', left: dot(i).x - 15 * s, top: dot(i).y - 15 * s, width: 30 * s, height: 30 * s, borderRadius: '50%', background: C.accent, border: `${1 * s}px solid ${C.paper}` }} />)}
              {fret.map((n: number, i: number) => n < 0 && <span key={i} style={{ position: 'absolute', left: (116 + i * 100) * s, top: 355 * s, color: '#E8E8E8', fontSize: 16 * s }}>×</span>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 * s }}>
              {['1', '2', '3', '4'].map((x, i) => <span key={x} style={{ width: 38 * s, height: 38 * s, borderRadius: 11 * s, display: 'grid', placeItems: 'center', background: i === 0 ? C.accent : '#262626', color: '#fff', fontSize: 14 * s }}>{x}</span>)}
            </div>
            <button style={{ marginTop: 18 * s, border: 0, borderRadius: 10 * s, padding: `${12 * s}px ${22 * s}px`, background: C.accent, color: '#fff', fontSize: 14 * s, fontWeight: 650 }}>Strum</button>
          </div>
          <div style={{ width: 290 * s, minWidth: 220 * s, borderRadius: 16 * s, background: '#1A1A1A', border: `${1 * s}px solid #363636`, padding: `${22 * s}px`, alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 18 * s, fontWeight: 650 }}>Practice loop</div>
            <div style={{ color: '#9E9E9E', fontSize: 12 * s, marginTop: 9 * s }}>Set a section to repeat</div>
            <div style={{ display: 'flex', gap: 8 * s, marginTop: 22 * s }}>
              {['Set A', 'Set B'].map((x, i) => <span key={x} style={{ flex: 1, textAlign: 'center', padding: `${9 * s}px ${4 * s}px`, borderRadius: 8 * s, border: `${1 * s}px solid ${i === 0 ? C.accent : '#4B4B4B'}`, color: '#ECECEC', fontSize: 12 * s }}>{x}</span>)}
            </div>
            <div style={{ marginTop: 18 * s, height: 5 * s, borderRadius: 6 * s, background: '#3A3A3A', overflow: 'hidden' }}><div style={{ width: `${Math.min(72, 18 + frame / 4)}%`, height: '100%', background: C.accent }} /></div>
            <div style={{ marginTop: 21 * s, display: 'flex', flexDirection: 'column', gap: 10 * s }}>
              {['Enable loop', 'Clear A and B'].map((x) => <div key={x} style={{ padding: `${10 * s}px`, borderRadius: 8 * s, border: `${1 * s}px solid #3A3A3A`, color: '#D5D5D5', fontSize: 12 * s }}>{x}</div>)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18 * s, display: 'flex', gap: 8 * s }}>{['C', 'Cm', 'C7', 'Cmaj7', 'Csus4'].map((x, i) => <span key={x} style={{ padding: `${7 * s}px ${12 * s}px`, borderRadius: 8 * s, background: i === 0 ? '#3B1822' : '#222', color: i === 0 ? '#FF7996' : '#A4A4A4', fontSize: 13 * s }}>{x}<small style={{ marginLeft: 8 * s, color: '#747474' }}>4 voicings</small></span>)}</div>
      </div>
    </div>
  );
};
