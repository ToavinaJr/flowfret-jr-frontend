import { Link } from "react-router-dom";
import { Settings, LogOut, Camera } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyProfile, saveProfileImage, uploadImages } from "@/services/api";
import { useTranslation } from "react-i18next";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const initial = (user?.username?.[0] ?? "U").toUpperCase();
  const [profileId, setProfileId] = useState<string>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { if (user) void fetchMyProfile(user.id).then((profile) => { setProfileId(profile?.id); setAvatarUrl(profile?.avatarUrl ?? null); }); }, [user]);
  async function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try { const [uploaded] = await uploadImages([file]); await saveProfileImage(user.id, user.username, uploaded.storagePath, profileId); setAvatarUrl(uploaded.storagePath); const profile = await fetchMyProfile(user.id); setProfileId(profile?.id); } finally { setUploading(false); event.target.value = ''; }
  }

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
          <label className="relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-xl font-bold text-primary-foreground sm:h-16 sm:w-16">
            {avatarUrl ? <img src={avatarUrl} alt="Photo de profil" className="h-full w-full object-cover" /> : initial}
            <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity hover:opacity-100"><Camera className="h-5 w-5" /></span>
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={changeAvatar} className="sr-only" />
          </label>
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
          {t("profile.openMenu")}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md bg-secondary py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
        >
          <LogOut className="h-4 w-4" />
          {t("profile.logout")}
        </button>
      </div>

      <div className="mt-2 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground sm:p-4">
        {t("profile.description")}
      </div>
    </div>
  );
};

export default ProfilePage;
