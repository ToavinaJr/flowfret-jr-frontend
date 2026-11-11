import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { PopupTitle } from "@/components/ui/PopupTitle";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { fetchConversations, sendMessage, type ChatConversation } from "@/services/chatApi";
import type { MusicTrack } from "@/types/music";

function conversationTitle(conversation: ChatConversation, currentUserId: string | undefined, groupLabel: string, directLabel: string) {
  if (conversation.type === "GROUP") return conversation.name || groupLabel;
  const other = conversation.participants.find((participant) => participant.userId !== currentUserId);
  return other?.nickname || other?.username || directLabel;
}

export function ShareTrackButton({ track }: { track: MusicTrack }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const conversations = useQuery({ queryKey: ["chat-conversations"], queryFn: fetchConversations, enabled: open });

  async function share(conversationId: string) {
    setSendingId(conversationId);
    const flowFretUrl = new URL("/music", window.location.origin);
    flowFretUrl.searchParams.set(
      "q",
      `${track.title} ${track.artists.map((artist) => artist.name).join(" ")}`,
    );
    const message = t("music.sharedTrackMessage", {
      title: track.title,
      artists: track.artists.map((artist) => artist.name).join(", "),
      url: flowFretUrl.toString(),
    });
    try {
      await sendMessage(conversationId, message, []);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["chat-messages", conversationId] }),
        queryClient.invalidateQueries({ queryKey: ["chat-conversations"] }),
      ]);
      toast.success(t("music.trackShared"));
      setOpen(false);
    } catch {
      toast.error(t("music.trackShareFailed"));
    } finally {
      setSendingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={t("music.shareTrackNamed", { title: track.title })} title={t("music.shareInChat")}>
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("music.share")}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md overflow-y-auto">
        <DialogHeader>
          <PopupTitle icon={Share2}>{t("music.shareInChat")}</PopupTitle>
          <DialogDescription className="truncate">{track.title}</DialogDescription>
        </DialogHeader>
        {conversations.isLoading ? (
          <div className="flex min-h-24 items-center justify-center" role="status"><Loader2 className="h-5 w-5 animate-spin" /><span className="sr-only">{t("common.loading")}</span></div>
        ) : conversations.isError ? (
          <div className="space-y-3"><p role="alert" className="text-sm text-muted-foreground">{t("music.conversationsLoadFailed")}</p><button type="button" onClick={() => void conversations.refetch()} className="min-h-10 rounded-md border border-border px-3 text-sm hover:bg-secondary">{t("common.retry")}</button></div>
        ) : (conversations.data ?? []).length ? (
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {conversations.data!.map((conversation) => (
              <li key={conversation.id}>
                <button type="button" disabled={sendingId !== null} onClick={() => void share(conversation.id)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-border px-3 text-left text-sm hover:bg-secondary disabled:opacity-60">
                  <span className="min-w-0 truncate font-medium">{conversationTitle(conversation, user?.id, t("chat.group"), t("chat.conversation"))}</span>
                  {sendingId === conversation.id ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="py-4 text-sm text-muted-foreground">{t("music.noConversationsToShare")}</p>}
      </DialogContent>
    </Dialog>
  );
}
