import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Camera, Save, Settings, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PAGE_SHELL, PAGE_TITLE } from '@/constants/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createFeedComment, createFeedLike, deleteFeedLike, fetchMyProfile, saveProfile, uploadImages } from '@/services/api';
import { FeedCard } from '@/pages/FeedPage';
import type { FeedPost } from '@/types/feed';

export default function ProfilePage() {
  const { user } = useAuth();
  const { userId } = useParams();
  const viewedId = userId ?? user?.id;
  const own = viewedId === user?.id;
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof fetchMyProfile>>>(null);
  const [displayName, setDisplayName] = useState(''); const [bio, setBio] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');
  const [saving, setSaving] = useState(false);
  const load = async () => { if (!viewedId) return; const value = await fetchMyProfile(viewedId); setProfile(value); setDisplayName(value?.displayName ?? (own ? user?.username ?? '' : '')); setBio(value?.bio ?? ''); setVisibility(value?.visibility ?? 'PUBLIC'); };
  useEffect(() => { void load(); }, [viewedId]);
  async function changeAvatar(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file || !user || !own) return; setSaving(true); try { const [image] = await uploadImages([file]); await saveProfile(user.id, { displayName: displayName || user.username, bio, visibility, avatarUrl: image.storagePath }, profile?.id); await load(); toast.success('Photo de profil mise à jour.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Échec de l’envoi.'); } finally { setSaving(false); event.target.value = ''; } }
  async function submit() { if (!user || !own) return; setSaving(true); try { await saveProfile(user.id, { displayName, bio, visibility }, profile?.id); await load(); toast.success('Profil mis à jour.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Échec de la modification.'); } finally { setSaving(false); } }
  async function comment(postId: string, content: string) {
    if (!user) return;
    await createFeedComment({ postId, content, authorId: user.id });
    await load();
  }
  async function toggleLike(post: FeedPost) {
    if (!user) return;
    const like = post.likes.find(item => item.userId === user.id);
    if (like) await deleteFeedLike(like.id);
    else await createFeedLike(post.id, user.id);
    await load();
  }
  if (!viewedId) return null;
  if (!profile && !own) return <main className={PAGE_SHELL}><p>Ce profil est privé ou introuvable.</p></main>;
  const avatar = profile?.avatarUrl;
  return <main className={PAGE_SHELL}>
    <header className="mb-6 flex items-center justify-between"><h1 className={`${PAGE_TITLE} mb-0`}>Profil</h1><div className="flex gap-2"><Link to="/friends" aria-label="Amis" className="rounded-md bg-card p-3"><Users className="h-4 w-4"/></Link>{own && <Link to="/parametres" aria-label="Paramètres" className="rounded-md bg-card p-3"><Settings className="h-4 w-4"/></Link>}</div></header>
    <section className="mb-6 rounded-xl border bg-card p-5">
      <div className="mb-5 flex items-center gap-4"><label className={`relative grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-primary text-xl text-primary-foreground ${own ? 'cursor-pointer' : ''}`}>{avatar ? <img src={avatar} alt="Photo de profil" className="h-full w-full object-cover"/> : (profile?.user.username ?? user?.username ?? 'U')[0].toUpperCase()}{own && <><span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 hover:opacity-100"><Camera/></span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={changeAvatar}/></>}</label><div><div className="text-xl font-semibold">{profile?.displayName || displayName}</div><div className="text-muted-foreground">@{profile?.user.username || user?.username}</div></div></div>
      {own ? <div className="space-y-3"><label className="block text-sm">Nom affiché<input value={displayName} onChange={e => setDisplayName(e.target.value)} maxLength={120} className="mt-1 min-h-11 w-full rounded-md border bg-background px-3"/></label><label className="block text-sm">Bio<textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={1000} rows={4} className="mt-1 w-full rounded-md border bg-background p-3"/></label><label className="block text-sm">Visibilité<select value={visibility} onChange={e => setVisibility(e.target.value as typeof visibility)} className="mt-1 min-h-11 w-full rounded-md border bg-background px-3"><option value="PUBLIC">Public</option><option value="FRIENDS">Amis</option><option value="PRIVATE">Privé</option></select></label><button disabled={saving || !displayName.trim()} onClick={() => void submit()} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50"><Save className="h-4 w-4"/>Enregistrer</button></div> : <p className="whitespace-pre-wrap text-muted-foreground">{profile?.bio || 'Aucune bio.'}</p>}
    </section>
    <h2 className="mb-3 text-lg font-semibold">Publications</h2>
    <div className="space-y-3 sm:space-y-4">{(profile?.user.authoredPosts ?? []).map(post => <FeedCard key={post.id} post={post} onComment={comment} currentUserId={user?.id ?? ''} onToggleLike={toggleLike} onChanged={load}/>)}</div>
    {profile && profile.user.authoredPosts.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucune publication pour le moment.</p>}
  </main>;
}
