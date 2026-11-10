import React from 'react';
import { AbsoluteFill } from 'remotion';
import { U } from '../brand/tokens';
import { DirBlur } from '../fx/Defocus';
import { face, KIT_TYPE, surfaceShadow } from '../kit';
import { E, hitPulse, lmix, prog } from '../lib/anim';
import { phrase } from '../lib/cadence';
import { ACT, CUE, f60x, FPS, H, W } from '../timeline';
import { WALK } from '../walk';
import { PILL_BOX, PillContent } from './Feed';
import { Ground, HOLD, launchOut, ScriptLine, themeOf, useAbs } from './stage';

// INSIGHT - the selected chord and its voicing count arrive as one pill; related chord results rise on a slower plane,
// then the camera pushes in and whips left into the choice of voicing.
// choice, its last frame the fastest.

/** The whip into the choice: px per frame on the cut, leftward. */
export const WHIP_LEFT = { vCut: -96 * U };

const QUOTE = { w: 700 * U, h: 190 * U, gap: 40 * U, y: 760 * U } as const;
/** The line's centre: in the middle band (40 % of the height), centred, the pill under it. */
const LINE_Y = 0.4 * H;
/** The three quotes' onsets: phrased into the last (lib/cadence), the span of an 8 f stagger. */
const QUOTE_ON = phrase(3, f60x(8), { shape: 'settle', seed: 'insight-quotes' }).onsets;

/** A related chord result from the local library. */
const Quote: React.FC<{ i: number }> = ({ i }) => {
  const t = themeOf('insight');
  const r = WALK.feed.rows[(WALK.feed.key + i + 1) % WALK.feed.rows.length];
  return (
    <div data-ui style={{ width: QUOTE.w, height: QUOTE.h, borderRadius: 28 * U, background: t.surface, boxShadow: surfaceShadow(t, 22, U), display: 'flex', alignItems: 'center', gap: 24 * U, padding: `0 ${30 * U}px`, boxSizing: 'border-box' }}>
      <div style={{ width: 72 * U, height: 72 * U, display: 'grid', placeItems: 'center', borderRadius: 16 * U, background: t.raised, color: t.text, fontSize: KIT_TYPE.label * U, fontWeight: 700 }}>{r.who}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 * U, minWidth: 0 }}>
        <span data-text={`quote-who-${i}`} style={face(KIT_TYPE.label * U, 600, t.mute)}>
          Chord Explorer
        </span>
        <span data-text={`quote-text-${i}`} style={face(KIT_TYPE.body * U, 560, t.text)}>
          {r.text}
        </span>
      </div>
    </div>
  );
};

export const Insight: React.FC = () => {
  const F = useAbs('insight');
  const t = themeOf('insight');
  const chip = prog(F, CUE.chip, CUE.chip + f60x(24), E.glideOut);
  const dx = launchOut('insight', F, WHIP_LEFT.vCut);
  const whipV = (dx - launchOut('insight', F - 1, WHIP_LEFT.vCut)) / U;
  const k = lmix(1, 1.06, prog(F, ACT.insight.from, ACT.pick.from, E.glideOut));
  const d = HOLD; // the hold rests between moves (no drift)
  const glint = hitPulse(F - CUE.pillGlint, 3, 10, FPS); // the pill's ring catches the light once before the whip
  return (
    <AbsoluteFill style={{ background: t.ground, overflow: 'hidden' }}>
      <DirBlur v={whipV} axis="x" id="insight-whip">
        <div style={{ position: 'absolute', inset: 0, transform: `translate3d(${(dx + d.x).toFixed(3)}px, ${d.y.toFixed(3)}px, 0)` }}>
          <Ground act="insight" F={F} />
          {/* the words people wrote: a slower plane (0.6 of the push), the outer cards cropped by the frame */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: `${W / 2}px ${H / 2}px`, transform: `scale(${lmix(1, k, 0.6).toFixed(5)})` }}>
            {[-1, 0, 1].map((j, i) => {
              const at = CUE.say4 + f60x(18) + QUOTE_ON[i]; // phrased (lib/cadence), never 8 f apart on a metronome
              const p = prog(F, at, at + f60x(40), E.glideOut);
              if (p <= 0) return null;
              const x = W / 2 + j * (QUOTE.w + QUOTE.gap) - QUOTE.w / 2;
              return (
                <div key={j} style={{ position: 'absolute', left: 0, top: 0, opacity: Math.min(1, p * 1.8), transform: `translate3d(${x.toFixed(2)}px, ${(QUOTE.y + (1 - p) * 120 * U).toFixed(2)}px, 0)` }}>
                  <Quote i={i} />
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: `${W / 2}px ${H / 2}px`, transform: `scale(${k.toFixed(5)})` }}>
            <ScriptLine id="insight" F={F} y={LINE_Y} color={t.text} accent={t.accent} mute={t.mute} />
            <div data-ui style={{ position: 'absolute', left: 0, top: 0, width: PILL_BOX.w, height: PILL_BOX.h, borderRadius: PILL_BOX.h / 2, background: t.surface, boxShadow: `${surfaceShadow(t, 34, U)}, inset 0 0 0 ${((3 + 2 * glint) * U).toFixed(2)}px ${t.accent}`, transform: `translate3d(${(PILL_BOX.cx - PILL_BOX.w / 2).toFixed(2)}px, ${(PILL_BOX.cy - PILL_BOX.h / 2).toFixed(2)}px, 0) scale(${(1 + 0.025 * glint).toFixed(4)})` }}>
              <PillContent chip={chip} />
            </div>
          </div>
        </div>
      </DirBlur>
    </AbsoluteFill>
  );
};

