import { Settings, MapPin, Calendar } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-foreground">Profile</h1>
        <button className="p-2 rounded-md bg-card text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-card rounded-lg p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground flex-shrink-0">
            A
          </div>
          <div className="flex-1">
            <div className="text-lg font-medium text-foreground">alex_riffs</div>
            <div className="text-body text-muted-foreground mt-1">
              Jazz guitarist exploring modal harmony. Currently obsessed with Wes Montgomery voicings.
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Paris, FR</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined Mar 2025</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
          {[
            { label: "Posts", value: "24" },
            { label: "Followers", value: "1.2K" },
            { label: "Following", value: "89" },
            { label: "Chords", value: "156" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-musical text-lg font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6">
        <button className="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          Edit Profile
        </button>
        <button className="flex-1 py-2 rounded-md bg-secondary text-foreground text-sm font-medium hover:bg-surface-hover transition-colors">
          Share Profile
        </button>
      </div>

      {/* Saved chords */}
      <div className="bg-card rounded-lg p-4 mb-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Saved Chords</div>
        <div className="flex flex-wrap gap-2">
          {["Am7", "Cmaj9", "Dm9", "G7", "Fmaj7", "Bdim7", "E7#9", "Ab13"].map((chord) => (
            <span key={chord} className="px-3 py-1.5 rounded-md bg-secondary text-sm font-musical text-foreground">
              {chord}
            </span>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-card rounded-lg p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</div>
        <div className="space-y-3">
          {[
            { action: "Uploaded a new riff", time: "2h ago" },
            { action: "Saved chord Cmaj9", time: "5h ago" },
            { action: "Followed @sara.guitar", time: "1d ago" },
            { action: "Analyzed 3 audio files", time: "2d ago" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <span className="text-body text-foreground">{activity.action}</span>
              <span className="text-xs font-musical text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
