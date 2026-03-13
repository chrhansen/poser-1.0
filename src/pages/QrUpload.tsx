import { useState, useCallback, useRef } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { analysisService } from "@/services/analysis.service";
import { useSearchParams } from "react-router-dom";

type MobileUploadState = "choose" | "uploading" | "done" | "error";

export default function QrUpload() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<MobileUploadState>("choose");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      const validation = analysisService.validateFile(file);
      if (!validation.valid) {
        setErrorMsg(validation.error!);
        setState("error");
        return;
      }

      setState("uploading");
      setProgress(0);

      try {
        // TODO_BACKEND_HOOKUP: replace with real upload that includes sessionId
        await analysisService.uploadClip(file, "center", (pct) =>
          setProgress(pct)
        );
        setState("done");
      } catch (err: any) {
        setErrorMsg(err?.message ?? "Upload failed. Please try again.");
        setState("error");
      }
    },
    [sessionId]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const retry = () => {
    setState("choose");
    setProgress(0);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Branding */}
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Poser
        </p>

        {/* ── Choose ─────────────────────────── */}
        {state === "choose" && (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <Upload className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Choose a ski clip
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a clip from your camera roll. It will upload automatically.
              </p>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => inputRef.current?.click()}
            >
              Choose clip
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              capture="environment"
              className="hidden"
              onChange={handleInputChange}
            />
            <p className="text-xs text-muted-foreground">
              MP4, MOV or WebM · up to 250 MB
            </p>
          </div>
        )}

        {/* ── Uploading ──────────────────────── */}
        {state === "uploading" && (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div>
              <p className="text-base font-medium text-foreground">
                Uploading…
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep this page open until it finishes.
              </p>
            </div>
            <Progress value={progress} className="h-2 w-full" />
            <p className="text-sm font-medium tabular-nums text-foreground">
              {progress}%
            </p>
          </div>
        )}

        {/* ── Done ───────────────────────────── */}
        {state === "done" && (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Upload complete!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                You can close this page and continue on your computer.
              </p>
            </div>
          </div>
        )}

        {/* ── Error ──────────────────────────── */}
        {state === "error" && (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Something went wrong
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{errorMsg}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={retry}>
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
