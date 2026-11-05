import { useState, type MouseEvent, type ReactNode } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { PopupTitle } from "@/components/ui/PopupTitle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LogoutConfirmationDialogProps {
  trigger: ReactNode;
}

export function LogoutConfirmationDialog({ trigger }: LogoutConfirmationDialogProps) {
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
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-xl">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-center">
          <div className="min-w-0 space-y-5">
            <AlertDialogHeader className="space-y-3 text-left">
              <PopupTitle icon={LogOut} variant="alert" tone="destructive">{t("settings.logoutConfirmationTitle")}</PopupTitle>
              <AlertDialogDescription>
                {t("settings.logoutConfirmationDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:justify-start sm:space-x-0">
              <AlertDialogCancel
                disabled={pending}
                className="mt-0 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              >
                {t("settings.logoutCancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirm}
                disabled={pending}
                className="gap-2 border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("settings.logoutConfirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
          <LogoutPracticeIllustration />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function LogoutPracticeIllustration() {
  return (
    <svg
      viewBox="0 0 208 168"
      aria-hidden="true"
      className="hidden h-auto w-full overflow-visible text-primary sm:block"
    >
      <rect x="8" y="8" width="192" height="152" rx="18" fill="hsl(var(--secondary))" />
      <g fill="none" stroke="hsl(var(--muted-foreground) / .25)" strokeWidth="1">
        <path d="M28 56h160M28 72h160M28 88h160M28 104h160" />
        <path d="M48 48v64M80 48v64M112 48v64M144 48v64M176 48v64" />
      </g>
      <path d="M28 80h20l7-17 10 36 10-49 11 62 11-41 9 21 10-13 11 4 10-27 11 41 10-19 10 7h20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      <path d="M48 128v9M144 128v9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <rect x="38" y="121" width="20" height="15" rx="4" fill="hsl(var(--primary) / .12)" stroke="currentColor" />
      <rect x="134" y="121" width="20" height="15" rx="4" fill="hsl(var(--primary) / .12)" stroke="currentColor" />
      <text x="44" y="132" fill="currentColor" fontFamily="ui-monospace, monospace" fontSize="9" fontWeight="700">A</text>
      <text x="140" y="132" fill="currentColor" fontFamily="ui-monospace, monospace" fontSize="9" fontWeight="700">B</text>
      <g className="logout-practice-cursor">
        <path d="M48 40v77" stroke="currentColor" strokeDasharray="3 4" strokeWidth="1.5" />
        <circle cx="48" cy="40" r="4" fill="currentColor" />
      </g>
    </svg>
  );
}
