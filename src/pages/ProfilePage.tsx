import { useEffect, useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Settings, Users } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  createFeedComment,
  createFeedLike,
  deleteFeedLike,
  fetchMyProfile,
  saveProfile,
  uploadImages,
} from "@/services/api";
import { FeedCard } from "@/pages/FeedPage";
import type { FeedPost } from "@/types/feed";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { ProfileSkeleton } from "@/components/skeletons/AppSkeletons";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userId } = useParams();
  const viewedId = userId ?? user?.id;
  const own = viewedId === user?.id;
  const [profile, setProfile] =
    useState<Awaited<ReturnType<typeof fetchMyProfile>>>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [visibility, setVisibility] = useState<
    "PUBLIC" | "FRIENDS" | "PRIVATE"
  >("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    if (!viewedId) return;
    const value = await fetchMyProfile(viewedId);
    setProfile(value);
    setDisplayName(value?.displayName ?? (own ? (user?.username ?? "") : ""));
    setBio(value?.bio ?? "");
    setVisibility(value?.visibility ?? "PUBLIC");
  };
  useEffect(() => {
    let active = true;
    setLoading(true);
    setProfile(null);
    if (!viewedId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    void fetchMyProfile(viewedId)
      .then((value) => {
        if (!active) return;
        setProfile(value);
        setDisplayName(
          value?.displayName ?? (own ? (user?.username ?? "") : ""),
        );
        setBio(value?.bio ?? "");
        setVisibility(value?.visibility ?? "PUBLIC");
      })
      .catch(() => {
        if (active) setProfile(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [viewedId, own, user?.username]);
  async function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user || !own) return;
    setSaving(true);
    try {
      const [image] = await uploadImages([file]);
      await saveProfile(
        user.id,
        {
          displayName: displayName || user.username,
          bio,
          visibility,
          avatarUrl: image.storagePath,
        },
        profile?.id,
      );
      await load();
      toast.success(t("profilePage.avatarUpdated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("profilePage.uploadFailed"));
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }
  async function removeAvatar() {
    if (!user || !profile?.id || !own) return;
    await saveProfile(
      user.id,
      {
        displayName: displayName || user.username,
        bio,
        visibility,
        avatarUrl: null,
      },
      profile.id,
    );
    await load();
  }
  async function submit() {
    if (!user || !own) return;
    setSaving(true);
    try {
      await saveProfile(user.id, { displayName, bio, visibility }, profile?.id);
      await load();
      toast.success(t("profilePage.updated"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("profilePage.updateFailed"),
      );
    } finally {
      setSaving(false);
    }
  }
  async function comment(postId: string, content: string) {
    if (!user) throw new Error("Unauthenticated");
    const created = await createFeedComment({
      postId,
      content,
      authorId: user.id,
    });
    await load();
    return created;
  }
  async function toggleLike(post: FeedPost) {
    if (!user) return;
    if (post.viewerLikeId) await deleteFeedLike(post.viewerLikeId);
    else await createFeedLike(post.id, user.id);
    await load();
  }
  if (!viewedId) return null;
  if (loading)
    return (
      <main className={PAGE_SHELL}>
        <ProfileSkeleton />
      </main>
    );
  if (!profile && !own)
    return (
      <main className={PAGE_SHELL}>
        <p>{t("profilePage.privateOrMissing")}</p>
      </main>
    );
  const avatar = profile?.avatarUrl;
  return (
    <main className={PAGE_SHELL}>
      <header className="mb-6 flex items-center justify-between">
        <h1 className={`${PAGE_TITLE} mb-0`}>{t("profile.title")}</h1>
        <div className="flex gap-2">
          <Link
            to="/friends"
            aria-label={t("friends.title")}
            className="rounded-md bg-card p-3"
          >
            <Users className="h-4 w-4" />
          </Link>
          {own && (
            <Link
              to="/parametres"
              aria-label={t("profile.settings")}
              className="rounded-md bg-card p-3"
            >
              <Settings className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>
      <ProfileEditor
        own={own}
        avatar={avatar}
        username={profile?.user.username ?? user?.username}
        displayName={profile?.displayName || displayName}
        bio={profile?.bio ?? bio}
        visibility={visibility}
        saving={saving}
        onDisplayNameChange={setDisplayName}
        onBioChange={setBio}
        onVisibilityChange={setVisibility}
        onAvatarChange={changeAvatar}
        onRemoveAvatar={removeAvatar}
        onSubmit={() => void submit()}
      />
      <h2 className="mb-3 text-lg font-semibold">{t("profilePage.posts")}</h2>
      <div className="space-y-3 sm:space-y-4">
        {(profile?.user.authoredPosts ?? []).map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            onComment={comment}
            currentUserId={user?.id ?? ""}
            onToggleLike={toggleLike}
            onChanged={load}
          />
        ))}
      </div>
      {profile && profile.user.authoredPosts.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("profilePage.noPosts")}
        </p>
      )}
    </main>
  );
}
