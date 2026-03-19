import AudioPost from "@/components/AudioPost";
import { Search } from "lucide-react";

const MOCK_POSTS = [
  {
    username: "alex_riffs",
    caption: "Working on this jazzy progression. What do you think of the voicing on the Cmaj9? 🎸",
    chords: ["Am7", "Dm9", "G7", "Cmaj9"],
    likes: 42,
    comments: 7,
    timestamp: "2h ago",
  },
  {
    username: "sara.guitar",
    caption: "Finally nailed this fingerpicking pattern after weeks of practice. The key was slowing it down to 60 BPM first.",
    chords: ["Em", "C", "G", "D"],
    likes: 128,
    comments: 23,
    timestamp: "5h ago",
  },
  {
    username: "blues_machine",
    caption: "Classic 12-bar blues in A. Sometimes you just need to go back to basics. Added a quick turnaround at the end.",
    chords: ["A7", "D7", "E7"],
    likes: 89,
    comments: 12,
    timestamp: "8h ago",
  },
  {
    username: "neo_classical",
    caption: "Exploring diminished arpeggios over this chord progression. The Bdim7 creates such a nice tension before resolving to C.",
    chords: ["Am", "Bdim7", "C", "E7"],
    likes: 67,
    comments: 15,
    timestamp: "12h ago",
  },
];

const FeedPage = () => {
  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-foreground">Feed</h1>
        <button className="p-2 rounded-md bg-card text-muted-foreground hover:text-foreground transition-colors">
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium">
          Recent
        </button>
        <button className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
          Popular
        </button>
        <button className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground transition-colors">
          Following
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {MOCK_POSTS.map((post, i) => (
          <AudioPost key={i} {...post} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
