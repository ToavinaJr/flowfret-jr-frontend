import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { analyzeAudioFile } from "@/utils/chordDetection";
import { setImportedSong } from "@/utils/importStore";
import type { SongMeta } from "@/types/song";

type UploadStatus = "idle" | "analyzing" | "error";

const UploadPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function processFile(file: File) {
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name)) {
      setStatus("error");
      setErrorMessage("Please select an audio file (MP3, WAV…).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setStatus("error");
      setErrorMessage("File too large (max 20MB).");
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
      setImportedSong({ meta, uri });
      navigate("/player");
    } catch {
      setStatus("error");
      setErrorMessage("Analysis failed. Try another file.");
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  if (status === "analyzing") {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
        <h1 className="text-display text-foreground mb-6">Analyzing…</h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-3">{progressLabel}</p>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-[width] duration-150"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-xs font-musical text-muted-foreground mt-2">
            {Math.round(progress * 100)}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-6">Upload & Analyze</h1>

      <div
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
        }}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors min-h-[200px] flex flex-col items-center justify-center ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground"
        }`}
      >
        <Upload
          className={`h-10 w-10 mx-auto mb-4 ${
            dragOver ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <div className="text-sm text-foreground mb-1">
          Drop your audio file here
        </div>
        <div className="text-xs text-muted-foreground">MP3, WAV · Max 20MB</div>
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

      <div className="mt-8 bg-card rounded-lg p-4 border border-border">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          How it works
        </div>
        <div className="space-y-3">
          {[
            "Upload your riff, cover, or composition",
            "Client-side Goertzel analysis detects chord roots",
            "Open the player with synced chord cues",
            "Preview fingerings on the fretboard",
          ].map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-musical text-muted-foreground">
                  {i + 1}
                </span>
              </div>
              <span className="text-body text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
