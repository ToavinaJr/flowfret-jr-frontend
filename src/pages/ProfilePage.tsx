import { Link } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const initial = (user?.username?.[0] ?? "U").toUpperCase();

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-foreground">Profile</h1>
        <Link
          to="/parametres"
          className="p-2 min-h-[44px] min-w-[44px] rounded-md bg-card text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1">
            <div className="text-lg font-medium text-foreground">
              {user?.username ?? "Guest"}
            </div>
            <div className="text-body text-muted-foreground mt-1">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Link
          to="/menu"
          className="flex-1 min-h-[44px] py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center justify-center"
        >
          Open menu
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex-1 min-h-[44px] py-2 rounded-md bg-secondary text-foreground text-sm font-medium hover:bg-surface-hover transition-colors inline-flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
        Practice tools live under Chords, Scales, Player, Metronome, and Upload.
        Your feed posts sync with the NestJS GraphQL backend when it is online.
      </div>
    </div>
  );
};

export default ProfilePage;
