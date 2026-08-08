import { useState, type MouseEvent, type ReactNode } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  entity: "post" | "comment";
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
        <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive"><Trash2 className="h-5 w-5" /></div>
        <AlertDialogTitle>{t(`deleteDialog.${entity}.title`)}</AlertDialogTitle>
        <AlertDialogDescription>{t(`deleteDialog.${entity}.description`)}</AlertDialogDescription>
      </AlertDialogHeader>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={pending}>{t("deleteDialog.cancel")}</AlertDialogCancel>
        <AlertDialogAction onClick={confirm} disabled={pending} className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}{t(pending ? "deleteDialog.deleting" : "deleteDialog.confirm")}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
