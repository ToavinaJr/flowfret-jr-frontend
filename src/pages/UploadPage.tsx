import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { Upload } from "lucide-react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { analyzeAudioFile } from "@/utils/chordDetection";
import type { SongMeta } from "@/types/song";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ImportedSong } from "@/types/song";
import { ImportedSongPlayer } from "@/components/features/music/ImportedSongPlayer";
import { ChordAnalysisSkeleton } from "@/components/skeletons/AppSkeletons";

type UploadStatus = "idle" | "analyzing" | "error";

const UploadPage = () => {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importedSong, setImportedSongState] = useState<ImportedSong | null>(
    null,
  );

  async function processFile(file: File) {
    if (
      !file.type.startsWith("audio/") &&
      !/\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)
    ) {
      setStatus("error");
      setErrorMessage(t("upload.invalidFile"));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setStatus("error");
      setErrorMessage(t("upload.tooLarge"));
      return;
    }

    setStatus("analyzing");
    setErrorMessage(null);
    setProgress(0);

    try {
      const result = await analyzeAudioFile(file, (ratio, label) => {
        setProgress(ratio);
        setProgressLabel(label);
      });

      const uri = URL.createObjectURL(file);
      const meta: SongMeta = {
        audioFile: file.name,
        title: result.title,
        duration: result.duration,
        cues: result.cues,
      };
      const song = { meta, uri };
      setImportedSongState(song);
      setStatus("idle");
      toast.success("Analyse terminée.");
    } catch {
      setStatus("error");
      setErrorMessage(t("upload.analysisFailed"));
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  if (status === "analyzing") {
    return (
      <div className={`${PAGE_SHELL} max-w-5xl lg:max-w-5xl`}>
        <h1 className={PAGE_TITLE}>{t("upload.analyzing")}</h1>
        <p className="mb-3 text-sm text-muted-foreground">
          {progressLabel} · {Math.round(progress * 100)}%
        </p>
        <ChordAnalysisSkeleton />
      </div>
    );
  }

  return (
    <div
      className={`${PAGE_SHELL} ${importedSong ? "max-w-5xl lg:max-w-5xl" : "max-w-xl lg:max-w-xl"}`}
    >
      <h1 className={PAGE_TITLE}>{t("upload.title")}</h1>

      <div
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
        }}
        className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-center transition-all ${importedSong ? "min-h-20 gap-3 px-4 py-3" : "min-h-[160px] flex-col p-6 sm:min-h-[200px] sm:p-8 md:p-12"} ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground"
        }`}
      >
        <Upload
          className={`${importedSong ? "h-5 w-5" : "mx-auto mb-3 h-8 w-8 sm:mb-4 sm:h-10 sm:w-10"} ${
            dragOver ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <div className={importedSong ? "text-left" : undefined}>
          <div className="mb-1 text-sm font-medium text-foreground">
            {t(importedSong ? "upload.anotherAudio" : "upload.dropHere")}
          </div>
          <div className="text-xs text-muted-foreground">
            {t(importedSong ? "upload.replaceHint" : "upload.formats")}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {errorMessage && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      {importedSong ? <ImportedSongPlayer song={importedSong} /> : null}

      {!importedSong ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-3 sm:mt-8 sm:p-4">
          <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
            {t("upload.howItWorks")}
          </div>
          <div className="space-y-3">
            {["select", "analyze", "review", "preview"].map((stepKey, i) => (
              <div key={stepKey} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <span className="font-musical text-xs text-muted-foreground">
                    {i + 1}
                  </span>
                </div>
                <span className="text-body text-muted-foreground">
                  {t(`upload.steps.${stepKey}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UploadPage;
