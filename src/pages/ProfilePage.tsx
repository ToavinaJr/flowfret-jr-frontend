import { Link } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const initial = (user?.username?.[0] ?? "U").toUpperCase();

  return (
    <div className={`${PAGE_SHELL} max-w-xl lg:max-w-xl`}>
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <h1 className={`${PAGE_TITLE} mb-0`}>Profile</h1>
        <Link
          to="/parametres"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground sm:h-16 sm:w-16">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-medium text-foreground sm:text-lg">
              {user?.username ?? "Guest"}
            </div>
            <div className="text-body mt-1 break-all text-muted-foreground">
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <Link
          to="/menu"
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Open menu
        </Link>
        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground sm:p-4">
        Practice tools live under Chords, Scales, Player, Metronome, and Upload.
        Your feed posts sync with the NestJS GraphQL backend when it is online.
      </div>
    </div>
  );
};

export default ProfilePage;
