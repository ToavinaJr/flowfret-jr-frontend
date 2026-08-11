import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, MessageCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PAGE_SHELL, PAGE_TITLE } from '@/constants/navigation';
import { fetchNotificationPreferences, fetchNotifications, markNotificationRead, setNotificationPreference, type AppNotification, type NotificationKind } from '@/services/api';
import { Switch } from '@/components/ui/switch';

const preferenceLabels: Record<NotificationKind, string> = {
  FRIEND_POST: 'Publications de mes amis',
  POST_COMMENT: 'Commentaires sur mes publications',
  FOLLOWED_POST_ACTIVITY: 'Activité de mes amis sur les publications suivies',
};

function message(row: AppNotification): string {
  const actor = row.payload.actorUsername || 'Un ami';
  if (row.type === 'FRIEND_POST') return `${actor} a publié une nouvelle publication.`;
  if (row.type === 'POST_COMMENT') return `${actor} a commenté votre publication.`;
  return row.payload.action === 'POST_LIKED' ? `${actor} a réagi à une publication que vous suivez.` : `${actor} a commenté une publication que vous suivez.`;
}

export default function NotificationsPage() {
  const client = useQueryClient();
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: fetchNotifications });
  const preferences = useQuery({ queryKey: ['notification-preferences'], queryFn: fetchNotificationPreferences });
  const read = useMutation({ mutationFn: markNotificationRead, onSuccess: () => client.invalidateQueries({ queryKey: ['notifications'] }) });
  const updatePreference = useMutation({ mutationFn: ({ type, enabled }: { type: NotificationKind; enabled: boolean }) => setNotificationPreference(type, enabled), onSuccess: () => { toast.success('Préférence mise à jour.'); void client.invalidateQueries({ queryKey: ['notification-preferences'] }); }, onError: () => toast.error('Impossible de modifier cette préférence.') });
  const configured = new Map((preferences.data ?? []).map(row => [row.type, row.enabled]));
  const types = Object.keys(preferenceLabels) as NotificationKind[];
  return <main className={PAGE_SHELL}>
    <h1 className={PAGE_TITLE}>Notifications</h1>
    <section className="mb-7 rounded-xl border bg-card p-4"><h2 className="mb-4 font-semibold">Ce que je souhaite recevoir</h2><div className="space-y-4">{types.map(type => <label key={type} className="flex items-center justify-between gap-4 text-sm"><span>{preferenceLabels[type]}</span><Switch checked={configured.get(type) ?? true} disabled={updatePreference.isPending} onCheckedChange={enabled => updatePreference.mutate({ type, enabled })}/></label>)}</div></section>
    <section><h2 className="mb-3 font-semibold">Activité récente</h2><div className="space-y-2">{(notifications.data ?? []).map(row => <article key={row.id} className={`flex gap-3 rounded-lg border p-4 ${row.readAt ? 'bg-card' : 'border-primary/25 bg-primary/5'}`}><div className="mt-0.5">{row.type === 'FRIEND_POST' ? <Users className="h-5 w-5"/> : <MessageCircle className="h-5 w-5"/>}</div><div className="min-w-0 flex-1"><p className="text-sm">{message(row)}</p><div className="mt-2 flex flex-wrap gap-3 text-xs">{row.payload.actorId && <Link to={`/profile/${row.payload.actorId}`} className="text-primary hover:underline">Voir le profil</Link>}{!row.readAt && <button onClick={() => read.mutate(row.id)} className="text-muted-foreground hover:text-foreground">Marquer comme lue</button>}</div></div></article>)}</div>{notifications.isSuccess && notifications.data.length === 0 && <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground"><Bell className="mx-auto mb-2 h-5 w-5"/>Aucune notification pour le moment.</div>}</section>
  </main>;
}
