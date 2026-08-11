import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Search, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { PAGE_SHELL, PAGE_TITLE } from '@/constants/navigation';
import { fetchFriendships, respondFriendRequest, searchUsers, sendFriendRequest } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function FriendsPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [query, setQuery] = useState('');
  const friendships = useQuery({ queryKey: ['friendships'], queryFn: fetchFriendships });
  const results = useQuery({ queryKey: ['user-search', query], queryFn: () => searchUsers(query.trim()) });
  const refresh = () => client.invalidateQueries({ queryKey: ['friendships'] });
  const add = useMutation({ mutationFn: sendFriendRequest, onSuccess: () => { toast.success('Demande d’amitié envoyée.'); void refresh(); void results.refetch(); }, onError: (error: Error) => toast.error(error.message) });
  const respond = useMutation({ mutationFn: ({ id, accept }: { id: string; accept: boolean }) => respondFriendRequest(id, accept), onSuccess: () => { toast.success('Demande traitée.'); void refresh(); } });
  const rows = friendships.data ?? [];
  const existingIds = new Set(rows.filter(row => ['PENDING', 'ACCEPTED', 'BLOCKED'].includes(row.status)).flatMap(row => [row.requesterId, row.receiverId]));
  return <main className={PAGE_SHELL}>
    <h1 className={PAGE_TITLE}>Trouver des amis</h1>
    <label className="mb-6 flex items-center gap-2 rounded-lg border bg-card px-3"><Search className="h-4 w-4"/><input value={query} onChange={event => setQuery(event.target.value)} maxLength={50} placeholder="Rechercher un pseudo…" className="min-h-11 flex-1 bg-transparent outline-none"/></label>
    {rows.filter(row => row.status === 'PENDING' && row.receiverId === user?.id).map(row => <div key={row.id} className="mb-2 flex items-center gap-3 rounded-lg border bg-card p-3"><Link className="flex-1 font-medium" to={`/profile/${row.requester.id}`}>{row.requester.profile?.displayName || row.requester.username}</Link><button aria-label="Accepter" onClick={() => respond.mutate({ id: row.id, accept: true })} className="rounded-md bg-primary p-2 text-primary-foreground"><Check/></button><button aria-label="Refuser" onClick={() => respond.mutate({ id: row.id, accept: false })} className="rounded-md bg-secondary p-2"><X/></button></div>)}
    <h2 className="mb-3 mt-6 font-semibold">Personnes que vous pouvez ajouter</h2>
    {(results.data ?? []).map(person => <div key={person.id} className="mb-2 flex items-center gap-3 rounded-lg border bg-card p-3"><Link className="min-w-0 flex-1" to={`/profile/${person.id}`}><div className="font-medium">{person.profile?.displayName || person.username}</div><div className="truncate text-sm text-muted-foreground">@{person.username}</div></Link><button disabled={existingIds.has(person.id) || add.isPending} onClick={() => add.mutate(person.id)} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-primary-foreground disabled:opacity-50"><UserPlus className="h-4 w-4"/>Ajouter</button></div>)}
    {results.isSuccess && results.data.length === 0 && <p className="rounded-lg border border-dashed bg-card p-5 text-center text-sm text-muted-foreground">Aucune personne à ajouter pour le moment.</p>}
    <h2 className="mb-3 mt-8 font-semibold">Mes amis</h2>
    {rows.filter(row => row.status === 'ACCEPTED').map(row => { const person = row.requesterId === user?.id ? row.receiver : row.requester; return <Link key={row.id} to={`/profile/${person.id}`} className="mb-2 block rounded-lg border bg-card p-3 font-medium">{person.profile?.displayName || person.username}</Link>; })}
  </main>;
}
