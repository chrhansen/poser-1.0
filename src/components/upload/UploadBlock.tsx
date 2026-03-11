import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { analysisService } from "@/services/analysis.service";
import { AuthDialog } from "@/components/dialogs/AuthDialog";
import { UploadSkierSelect } from "@/components/upload/UploadSkierSelect";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UploadState = "idle" | "skier-select" | "uploading" | "success" | "error";

export function UploadBlock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [selectedSkierId, setSelectedSkierId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authContext, setAuthContext] = useState<"upload" | "signin" | "signup">("upload");
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((f: File) => {
    const validation = analysisService.validateFile(f);
    if (!validation.valid) {
      setErrorMsg(validation.error!);
      setState("error");
      return;
    }
    setFile(f);
    setErrorMsg("");
    setState("skier-select");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  };

  const handleUpload = async () => {
    if (!file) return;

    // If not signed in, show auth dialog in upload context
    if (!user) {
      setAuthContext("upload");
      setAuthOpen(true);
      return;
    }

    setState("uploading");
    setProgress(0);

    try {
      const result = await analysisService.uploadClip(file, "center", (pct) => setProgress(pct));
      setState("success");
      toast.success("Clip uploaded! Analyzing…");
      setTimeout(() => navigate(`/results/${result.id}`), 1200);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Upload failed. Please try again.");
      setState("error");
      toast.error("Upload failed. Please try again.");
    }
  };

  const reset = () => {
    setFile(null);
    setState("idle");
    setProgress(0);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <div id="upload" className="scroll-mt-24">
        <AnimatePresence mode="wait">
          {/* Idle / Drop zone */}
          {(state === "idle" || state === "error") && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
                dragOver ? "border-foreground bg-secondary" : "border-border",
                state === "error" && "border-destructive/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Drag & drop your ski clip here
              </p>
               <p className="mt-1 text-xs text-muted-foreground">
                 Up to 250 MB
               </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>
                Browse files
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={handleInputChange}
              />

              {state === "error" && errorMsg && (
                <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Skier selection — video preview + overlay */}
          {state === "skier-select" && file && (
            <motion.div
              key="skier-select"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <UploadSkierSelect
                file={file}
                onCancel={reset}
                onContinue={(skierId) => {
                  setSelectedSkierId(skierId);
                  if (!user) {
                    setAuthContext("upload");
                    setAuthOpen(true);
                  } else {
                    handleUpload();
                  }
                }}
              />

              {/* Inline helper for logged-out users */}
              {!user && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Requires a free account.{" "}
                  <button
                    onClick={() => { setAuthContext("signin"); setAuthOpen(true); }}
                    className="underline hover:text-foreground transition-colors"
                  >
                    Sign in
                  </button>{" "}
                  or{" "}
                  <button
                    onClick={() => { setAuthContext("signup"); setAuthOpen(true); }}
                    className="underline hover:text-foreground transition-colors"
                  >
                    create one
                  </button>{" "}
                  to upload your own clip.
                </p>
              )}
            </motion.div>
          )}

          {/* Uploading */}
          {state === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center rounded-2xl border border-border p-10 text-center"
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-foreground">Uploading & analyzing…</p>
              <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{progress}%</p>
            </motion.div>
          )}

          {/* Success */}
          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center rounded-2xl border border-border p-10 text-center"
            >
              <CheckCircle className="h-8 w-8 text-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">Upload complete</p>
              <p className="mt-1 text-xs text-muted-foreground">Redirecting to your results…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        context={authContext}
        onSuccess={handleUpload}
      />
    </>
  );
}
