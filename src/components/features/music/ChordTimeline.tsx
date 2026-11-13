import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import type { ChordCue } from "@/types/song";
import { getDisplayChordShape } from "@/utils/chordShape";

const VISIBLE_CHORD_RADIUS = 2;
const CHORD_SLOT_CLASSES: Record<number, string> = {
  0: "sm:block sm:col-start-1",
  1: "sm:block sm:col-start-2",
  2: "sm:block sm:col-start-3",
  3: "sm:block sm:col-start-4",
  4: "sm:block sm:col-start-5",
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

interface ChordTimelineProps {
  cues: readonly ChordCue[];
  activeIndex: number;
  capo: number;
  semitones?: number;
  onSeek?: (time: number) => void;
}

export function ChordTimeline({
  cues,
  activeIndex,
  capo,
  semitones = 0,
  onSeek,
}: ChordTimelineProps) {
  const { t } = useTranslation();
  const firstVisibleIndex = Math.max(0, activeIndex - VISIBLE_CHORD_RADIUS);
  const lastVisibleIndex = Math.min(
    cues.length,
    activeIndex + VISIBLE_CHORD_RADIUS + 1,
  );
  const firstMobileIndex = activeIndex === cues.length - 1
    ? Math.max(0, activeIndex - 1)
    : activeIndex;

  return (
    <section
      className="relative flex min-h-[250px] items-center overflow-hidden px-2 py-5 sm:min-h-[300px] sm:px-4"
      aria-label={t("player.timeline")}
    >
      <ol className="grid w-full grid-cols-2 items-center gap-2 sm:grid-cols-5">
        <AnimatePresence initial={false} mode="popLayout">
          {cues.slice(firstVisibleIndex, lastVisibleIndex).map((cue, offset) => {
            const cueIndex = firstVisibleIndex + offset;
            const distance = Math.abs(cueIndex - activeIndex);
            const isActive = cueIndex === activeIndex;
            const chord = getDisplayChordShape(cue.chord, capo, semitones);
            const time = formatTime(cue.start);
            const slotIndex = cueIndex - activeIndex + VISIBLE_CHORD_RADIUS;
            const mobileSlot = cueIndex - firstMobileIndex;
            const mobileSlotClass = mobileSlot === 0
              ? "col-start-1"
              : mobileSlot === 1
                ? "col-start-2"
                : "hidden";

            return (
              <motion.li
                layout="position"
                key={`${cue.start}-${cue.chord}`}
                className={`min-w-0 ${mobileSlotClass} ${CHORD_SLOT_CLASSES[slotIndex]}`}
                style={{
                  gridRowStart: 1,
                }}
                initial={{ opacity: 0, scale: 0.55 }}
                animate={{
                  opacity: isActive ? 1 : distance === 1 ? 0.55 : 0.28,
                  scale: isActive ? 1 : distance === 1 ? 0.8 : 0.64,
                  y: isActive ? -4 : 0,
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  disabled={!onSeek}
                  onClick={() => onSeek?.(cue.start)}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={t("player.seekChord", {
                    chord: chord.label,
                    time,
                  })}
                  className={`flex w-full min-w-0 flex-col items-center rounded-xl border px-0.5 py-2 transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-default sm:px-2 ${
                    isActive
                      ? "border-primary/70 bg-primary/10 text-primary shadow-sm"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/50"
                  }`}
                >
                  <div
                    className="pointer-events-none w-full [&_svg]:h-auto [&_svg]:max-w-full"
                    aria-hidden="true"
                  >
                    {chord.position ? (
                      <ChordDiagram
                        chord={chord.label}
                        position={chord.position}
                        scale={0.78}
                        interactive={false}
                      />
                    ) : (
                      <span className="grid min-h-28 place-items-center font-musical text-xl font-semibold sm:min-h-36 sm:text-2xl">
                        {chord.label}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                    {time}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </section>
  );
}
