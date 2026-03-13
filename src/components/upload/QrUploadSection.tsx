import { useState, useEffect, useCallback, useRef } from "react";
import {
  Smartphone,
  QrCode,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type QrSessionState =
  | "waiting"
  | "phone_opened"
  | "uploading"
  | "uploaded"
  | "expired"
  | "failed";

const POLL_INTERVAL_MS = 3_000;
const SESSION_TIMEOUT_MS = 2 * 60 * 1_000; // 2 minutes

/**
 * Generates a mock session id. Replace with real API call.
 */
function generateSessionId() {
  return crypto.randomUUID();
}

export function QrUploadSection() {
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [state, setState] = useState<QrSessionState>("waiting");
  const [uploadProgress, setUploadProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
    timerRef.current = null;
    pollRef.current = null;
  }, []);

  const startSession = useCallback(() => {
    cleanup();
    const newId = generateSessionId();
    setSessionId(newId);
    setState("waiting");
    setUploadProgress(0);

    // TODO: replace with real polling
    // pollRef.current = setInterval(async () => {
    //   const res = await fetch(`/api/qr-sessions/${newId}`);
    //   const data = await res.json();
    //   setState(data.state);
    //   if (data.state === "uploading") setUploadProgress(data.progress ?? 0);
    //   if (["uploaded", "failed"].includes(data.state)) cleanup();
    // }, POLL_INTERVAL_MS);

    // Expire after timeout
    timerRef.current = setTimeout(() => {
      cleanup();
      setState((prev) =>
        ["waiting", "phone_opened"].includes(prev) ? "expired" : prev
      );
    }, SESSION_TIMEOUT_MS);
  }, [cleanup]);

  useEffect(() => {
    startSession();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart = () => startSession();

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
      {/* ── Waiting ─────────────────────────────────────────── */}
      {state === "waiting" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Smartphone className="h-5 w-5 text-accent-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Send from your phone
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Most ski videos live on your phone. Scan to upload there.
          </p>
          <div className="mt-1 flex h-28 w-28 items-center justify-center rounded-lg border border-border bg-accent">
            <QrCode className="h-14 w-14 text-accent-foreground/60" />
          </div>
          <p className="text-[11px] text-muted-foreground animate-pulse">
            Waiting for scan…
          </p>
        </>
      )}

      {/* ── Phone opened ───────────────────────────────────── */}
      {state === "phone_opened" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Smartphone className="h-5 w-5 text-accent-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Phone connected
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Great — select and upload a clip on your phone now.
          </p>
          <div className="mt-1 flex h-10 w-10 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </>
      )}

      {/* ── Uploading ──────────────────────────────────────── */}
      {state === "uploading" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Upload className="h-5 w-5 text-accent-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Uploading from phone…
          </p>
          <div className="w-full max-w-[200px]">
            <Progress value={uploadProgress} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground">
            {uploadProgress}% — keep this page open
          </p>
        </>
      )}

      {/* ── Uploaded ───────────────────────────────────────── */}
      {state === "uploaded" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Clip received!
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Your clip has been uploaded. Preparing for analysis…
          </p>
        </>
      )}

      {/* ── Expired ────────────────────────────────────────── */}
      {state === "expired" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <QrCode className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            QR code expired
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            No upload was detected. Generate a new code to try again.
          </p>
          <Button variant="outline" size="sm" onClick={restart}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            New QR code
          </Button>
        </>
      )}

      {/* ── Failed ─────────────────────────────────────────── */}
      {state === "failed" && (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Upload failed
          </p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Something went wrong with the phone upload. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={restart}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Try again
          </Button>
        </>
      )}
    </div>
  );
}
