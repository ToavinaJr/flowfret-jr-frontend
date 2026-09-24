import type { ChangeEvent } from "react";
import { PROFILE_VISIBILITY, type ProfileVisibility } from "@/constants/domain";
import { Camera, Save, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DeleteConfirmationDialog } from "@/components/feed/DeleteConfirmationDialog";

interface ProfileEditorProps {
  own: boolean;
  avatar?: string | null;
  username?: string;
  displayName: string;
  bio: string;
  visibility: ProfileVisibility;
  saving: boolean;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onVisibilityChange: (value: ProfileVisibility) => void;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => Promise<void>;
  onSubmit: () => void;
}

export function ProfileEditor({
  own,
  avatar,
  username,
  displayName,
  bio,
  visibility,
  saving,
  onDisplayNameChange,
  onBioChange,
  onVisibilityChange,
  onAvatarChange,
  onRemoveAvatar,
  onSubmit,
}: ProfileEditorProps) {
  const { t } = useTranslation();
  return (
    <section className="mb-6 rounded-xl border bg-card p-5">
      <div className="mb-5 flex items-center gap-4">
        <div
          className={`relative grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-primary text-xl text-primary-foreground ${own ? "cursor-pointer" : ""}`}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={t("profile.avatarAlt")}
              className="h-full w-full object-cover"
            />
          ) : (
            (username ?? "U")[0].toUpperCase()
          )}
          {own && (
            <>
              <input
                id="profile-avatar"
                name="avatar"
                className="peer sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={saving}
                onChange={onAvatarChange}
              />
              <label
                htmlFor="profile-avatar"
                className="absolute inset-0 grid cursor-pointer place-items-center bg-black/40 opacity-0 hover:opacity-100 peer-focus-visible:opacity-100"
              >
                <Camera />
                <span className="sr-only">{t("profileEditor.changePhoto")}</span>
              </label>
            </>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-semibold">{displayName}</div>
          <div className="text-muted-foreground">@{username}</div>
          {own && avatar && (
            <DeleteConfirmationDialog
              entity="avatar"
              onConfirm={onRemoveAvatar}
              trigger={
                <button
                  type="button"
                  className="mt-2 inline-flex min-h-9 items-center gap-2 rounded-md bg-secondary px-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("profileEditor.removePhoto")}
                </button>
              }
            />
          )}
        </div>
      </div>
      {own ? (
        <div className="space-y-3">
          <label htmlFor="profile-display-name" className="block text-sm">
            {t("profileEditor.displayName")}
            <input
              id="profile-display-name"
              name="displayName"
              value={displayName}
              onChange={(event) => onDisplayNameChange(event.target.value)}
              maxLength={120}
              className="mt-1 min-h-11 w-full rounded-md border bg-background px-3"
            />
          </label>
          <label htmlFor="profile-bio" className="block text-sm">
            {t("profileEditor.bio")}
            <textarea
              id="profile-bio"
              name="bio"
              value={bio}
              onChange={(event) => onBioChange(event.target.value)}
              maxLength={1000}
              rows={4}
              className="mt-1 w-full rounded-md border bg-background p-3"
            />
          </label>
          <label htmlFor="profile-visibility" className="block text-sm">
            {t("profileEditor.visibility")}
            <select
              id="profile-visibility"
              name="visibility"
              value={visibility}
              onChange={(event) =>
                onVisibilityChange(event.target.value as ProfileVisibility)
              }
              className="mt-1 min-h-11 w-full rounded-md border bg-background px-3"
            >
              <option value={PROFILE_VISIBILITY.PUBLIC}>
                {t("profileEditor.public")}
              </option>
              <option value={PROFILE_VISIBILITY.FRIENDS}>
                {t("profileEditor.friends")}
              </option>
              <option value={PROFILE_VISIBILITY.PRIVATE}>
                {t("profileEditor.private")}
              </option>
            </select>
          </label>
          <button
            type="button"
            disabled={saving || !displayName.trim()}
            onClick={onSubmit}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {t("profileEditor.save")}
          </button>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-muted-foreground">
          {bio || t("profileEditor.noBio")}
        </p>
      )}
    </section>
  );
}
