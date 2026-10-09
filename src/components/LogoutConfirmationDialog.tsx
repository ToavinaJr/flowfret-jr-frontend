import { useState, type MouseEvent, type ReactNode } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LogoutConfirmationDialogProps {
  trigger: ReactNode;
  onOpen?: () => void;
}

export function LogoutConfirmationDialog({
  trigger,
  onOpen,
}: LogoutConfirmationDialogProps) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setPending(true);
    try {
      await logout();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        setOpen(next);
        if (next) onOpen?.();
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
        <AlertDialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </div>
          <AlertDialogTitle>{t("settings.logoutConfirmationTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("settings.logoutConfirmationDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {t("settings.logoutCancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={confirm} disabled={pending} className="gap-2">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t("settings.logoutConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
