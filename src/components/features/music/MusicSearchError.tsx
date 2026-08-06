import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MusicSearchErrorProps {
  message: string;
}

export function MusicSearchError({ message }: MusicSearchErrorProps) {
  const { t } = useTranslation();

  return (
    <Alert variant="destructive">
      <AlertTitle>{t("music.errorTitle")}</AlertTitle>
      <AlertDescription>{message || t("music.errorGeneric")}</AlertDescription>
    </Alert>
  );
}
