import { useState } from "react";
import { Heart, MessageCircle, Share2, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface AudioPostProps {
  username: string;
  avatar?: string;
  caption: string;
  chords?: string[];
  likes: number;
  comments: number;
  timestamp: string;
}

const AudioPost = ({
  username,
  caption,
  chords = [],
  likes,
  comments,
  timestamp,
}: AudioPostProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [progress] = useState(35);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
          {username[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {username}
          </div>
          <div className="text-xs text-muted-foreground">{timestamp}</div>
        </div>
      </div>

      <div className="px-3 pb-3 sm:px-4">
        <p className="text-body break-words text-foreground">{caption}</p>
      </div>

      <div className="px-3 pb-3 sm:px-4">
        <div className="rounded-md bg-secondary p-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary transition-opacity hover:opacity-90"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 text-primary-foreground" />
              )}
            </button>

            <div className="flex h-8 min-w-0 flex-1 items-end gap-[2px] overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => {
                const height = ((i * 37) % 85) + 15;
                const played = (i / 40) * 100 < progress;
                return (
                  <div
                    key={i}
                    className={`min-w-0 flex-1 rounded-sm transition-colors ${
                      played ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            <span className="shrink-0 font-musical text-xs text-muted-foreground">
              1:24
            </span>
          </div>

          <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {chords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-3 pb-3 sm:px-4">
          {chords.map((chord) => (
            <span
              key={chord}
              className="rounded-md bg-secondary px-2 py-1 font-musical text-xs text-foreground"
            >
              {chord}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-border px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          className="flex min-h-[44px] items-center gap-1.5 text-sm transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
          <span
            className={`font-musical text-xs ${isLiked ? "text-primary" : "text-muted-foreground"}`}
          >
            {isLiked ? likes + 1 : likes}
          </span>
        </button>
        <button
          type="button"
          className="flex min-h-[44px] items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="font-musical text-xs">{comments}</span>
        </button>
        <button
          type="button"
          className="ml-auto min-h-[44px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default AudioPost;
