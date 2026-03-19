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

const AudioPost = ({ username, caption, chords = [], likes, comments, timestamp }: AudioPostProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(35);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
          {username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">{username}</div>
          <div className="text-xs text-muted-foreground">{timestamp}</div>
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <p className="text-body text-foreground">{caption}</p>
      </div>

      {/* Waveform / Player */}
      <div className="px-4 pb-3">
        <div className="bg-secondary rounded-md p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
              )}
            </button>

            {/* Waveform bars */}
            <div className="flex-1 flex items-end gap-[2px] h-8">
              {Array.from({ length: 60 }).map((_, i) => {
                const height = Math.random() * 100;
                const played = (i / 60) * 100 < progress;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-colors ${
                      played ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                    style={{ height: `${Math.max(15, height)}%` }}
                  />
                );
              })}
            </div>

            <span className="text-xs font-musical text-muted-foreground flex-shrink-0">1:24</span>
          </div>

          {/* Progress line */}
          <div className="mt-2 h-0.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Chords */}
      {chords.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {chords.map((chord) => (
            <span
              key={chord}
              className="px-2 py-1 rounded-md bg-secondary text-xs font-musical text-foreground"
            >
              {chord}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-border">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="flex items-center gap-1.5 text-sm transition-colors"
        >
          <Heart
            className={`h-4 w-4 ${isLiked ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
          <span className={`font-musical text-xs ${isLiked ? "text-primary" : "text-muted-foreground"}`}>
            {isLiked ? likes + 1 : likes}
          </span>
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <MessageCircle className="h-4 w-4" />
          <span className="font-musical text-xs">{comments}</span>
        </button>
        <button className="text-muted-foreground hover:text-foreground transition-colors ml-auto">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default AudioPost;
