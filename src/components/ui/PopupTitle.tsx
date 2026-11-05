import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DialogTitle } from "@/components/ui/dialog";

interface PopupTitleProps {
  icon: LucideIcon;
  children: ReactNode;
  variant?: "dialog" | "alert";
  tone?: "default" | "destructive";
}

export function PopupTitle({
  icon: Icon,
  children,
  variant = "dialog",
  tone = "default",
}: PopupTitleProps) {
  const Title = variant === "alert" ? AlertDialogTitle : DialogTitle;
  const iconTone = tone === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary";

  return (
    <div className="flex min-w-0 items-center gap-3 pr-8 text-left">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${iconTone}`}>
        <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
      </span>
      <Title className="min-w-0 leading-snug">{children}</Title>
    </div>
  );
}
