import { useState, type MouseEvent, type ReactNode } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PopupTitle } from "@/components/ui/PopupTitle";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  entity: "post" | "comment" | "avatar";
  trigger: ReactNode;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmationDialog({ entity, trigger, onConfirm }: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const toastId = toast.loading(t("deleteDialog.deleting"));
    try {
      await onConfirm();
      toast.success(t(`deleteDialog.${entity}.success`), { id: toastId });
      setOpen(false);
    } catch {
      const message = t("deleteDialog.error");
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      setPending(false);
    }
  }

  return <AlertDialog open={open} onOpenChange={(next) => { if (!pending) { setOpen(next); setError(null); } }}>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
      <AlertDialogHeader>
        <PopupTitle icon={Trash2} variant="alert" tone="destructive">{t(`deleteDialog.${entity}.title`)}</PopupTitle>
        <AlertDialogDescription>{t(`deleteDialog.${entity}.description`)}</AlertDialogDescription>
      </AlertDialogHeader>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending} className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground">{t("deleteDialog.cancel")}</AlertDialogCancel>
        <AlertDialogAction onClick={confirm} disabled={pending} className="gap-2 border border-border bg-secondary text-secondary-foreground hover:bg-muted hover:text-foreground">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}{t(pending ? "deleteDialog.deleting" : "deleteDialog.confirm")}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
