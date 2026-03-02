import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, X, Loader2, AlertCircle, CheckCircle, Mail, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { analysisService, type SkierPosition } from "@/services/analysis.service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AnalysisResult } from "@/lib/types";

/**
 * Embed Widget — multi-step flow for partner-embedded analysis.
 * Flow: upload → skier-select → email → awaiting_confirmation → processing → results
 *
 * Props:
 *  - partnerSlug: identifies the partner context
 *  - partnerDomain: domain for config init
 *  - maxFileSizeMB: override default upload limit (default 100)
 *  - onComplete: callback when analysis completes
 */

export type EmbedWidgetStep =
  | "upload"
  | "skier-select"
  | "email"
  | "awaiting_confirmation"
  | "processing"
  | "results"
  | "error";

interface EmbedWidgetProps {
  partnerSlug?: string;
  partnerDomain?: string;
  maxFileSizeMB?: number;
  onComplete?: (result: AnalysisResult) => void;
}

const skierPositions: { value: SkierPosition; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export function EmbedWidget({
  partnerSlug,
  partnerDomain,
  maxFileSizeMB = 100,
  onComplete,
}: EmbedWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const [step, setStep] = useState<EmbedWidgetStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [skierPos, setSkierPos] = useState<SkierPosition>("center");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  // TODO_BACKEND_HOOKUP: Validate partner config on mount
  useEffect(() => {
    if (partnerSlug) {
      console.log(`[EmbedWidget] Partner init: slug=${partnerSlug}, domain=${partnerDomain}`);
    }
  }, [partnerSlug, partnerDomain]);

  // Polling while processing
  useEffect(() => {
    if (step !== "processing" || !analysisId) return;
    pollRef.current = setInterval(async () => {
      // TODO_BACKEND_HOOKUP: Poll real analysis status
      const updated = await analysisService.pollResult(analysisId);
      if (updated) {
        setUploadProgress(updated.progress ?? 0);
        if (updated.status === "complete") {
          clearInterval(pollRef.current);
          setResult(updated);
          setStep("results");
          onComplete?.(updated);
        } else if (updated.status === "error") {
          clearInterval(pollRef.current);
          setErrorMsg(updated.failedReason ?? "Analysis failed.");
          setStep("error");
        }
      }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, analysisId, onComplete]);

  const handleFileSelect = useCallback((f: File) => {
    const validation = analysisService.validateFile(f);
    if (!validation.valid) {
      setErrorMsg(validation.error!);
      setStep("error");
      return;
    }
    if (f.size > maxFileSizeMB * 1024 * 1024) {
      setErrorMsg(`File must be under ${maxFileSizeMB}MB.`);
      setStep("error");
      return;
    }
    setFile(f);
    setErrorMsg("");
    setStep("skier-select");
  }, [maxFileSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleEmailSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    // TODO_BACKEND_HOOKUP: Send confirmation email to user
    setStep("awaiting_confirmation");
    toast.success("Check your inbox for confirmation.");

    // Mock: auto-confirm after 3s
    setTimeout(() => {
      handleStartUpload();
    }, 3000);
  };

  const handleStartUpload = async () => {
    if (!file) return;
    setStep("processing");
    setUploadProgress(0);
    try {
      // TODO_BACKEND_HOOKUP: Upload file with partner context
      const res = await analysisService.uploadClip(file, skierPos, (pct) => setUploadProgress(pct));
      setAnalysisId(res.id);
      // Polling will take over from here
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Upload failed.");
      setStep("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStep("upload");
    setUploadProgress(0);
    setErrorMsg("");
    setEmail("");
    setEmailError("");
    setResult(null);
    setAnalysisId(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const transition = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-background p-6">
      {partnerSlug && (
        <p className="mb-4 text-center text-xs text-muted-foreground">
          Powered by Poser · {partnerSlug}
        </p>
      )}

      <AnimatePresence mode="wait">
        {/* ── Upload ── */}
        {(step === "upload" || step === "error") && (
          <motion.div key="upload" {...transition}>
            <div
              className={cn(
                "flex flex-col items-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                dragOver ? "border-foreground bg-secondary" : "border-border",
                step === "error" && "border-destructive/50"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">Drop your ski clip here</p>
              <p className="mt-1 text-xs text-muted-foreground">MP4, MOV, WebM · up to {maxFileSizeMB}MB</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => inputRef.current?.click()}>
                Browse files
              </Button>
              <input ref={inputRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
              {step === "error" && errorMsg && (
                <div className="mt-3 flex items-center gap-2 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Skier Select ── */}
        {step === "skier-select" && file && (
          <motion.div key="skier" {...transition}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <button onClick={reset} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
            <p className="mt-4 text-sm font-medium text-foreground">Where is the skier?</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {skierPositions.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setSkierPos(pos.value)}
                  className={cn(
                    "rounded-lg border p-2 text-sm transition-colors",
                    skierPos === pos.value ? "border-foreground bg-secondary font-medium" : "border-border hover:border-muted-foreground"
                  )}
                >
                  {pos.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={reset}><ArrowLeft className="mr-1 h-3 w-3" />Back</Button>
              <Button size="sm" className="flex-1" onClick={() => setStep("email")}>
                Continue <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Email ── */}
        {step === "email" && (
          <motion.div key="email" {...transition}>
            <div className="flex flex-col items-center text-center">
              <Mail className="h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">Enter your email to receive results</p>
              <p className="mt-1 text-xs text-muted-foreground">We'll send a confirmation link first.</p>
            </div>
            <div className="mt-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailSubmit()}
              />
              {emailError && <p className="mt-1 text-xs text-destructive">{emailError}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep("skier-select")}><ArrowLeft className="mr-1 h-3 w-3" />Back</Button>
              <Button size="sm" className="flex-1" onClick={handleEmailSubmit}>Send confirmation</Button>
            </div>
          </motion.div>
        )}

        {/* ── Awaiting Confirmation ── */}
        {step === "awaiting_confirmation" && (
          <motion.div key="awaiting" {...transition}>
            <div className="flex flex-col items-center text-center py-6">
              <Mail className="h-8 w-8 text-accent" />
              <p className="mt-3 text-sm font-medium text-foreground">Check your email</p>
              <p className="mt-1 text-xs text-muted-foreground">Click the link in your inbox to start analysis.</p>
              <Loader2 className="mt-4 h-4 w-4 animate-spin text-muted-foreground" />
              <p className="mt-2 text-[10px] text-muted-foreground">Waiting for confirmation…</p>
            </div>
          </motion.div>
        )}

        {/* ── Processing ── */}
        {step === "processing" && (
          <motion.div key="processing" {...transition}>
            <div className="flex flex-col items-center py-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="mt-3 text-sm font-medium text-foreground">Analyzing your skiing…</p>
              <p className="mt-1 text-xs text-muted-foreground">This usually takes 1–2 minutes.</p>
              <div className="mt-4 w-full">
                <Progress value={uploadProgress} className="h-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Results ── */}
        {step === "results" && result && (
          <motion.div key="results" {...transition}>
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-8 w-8 text-foreground" />
              <p className="mt-3 text-lg font-bold text-foreground">Score: {result.scores.overall}</p>
              <div className="mt-4 grid w-full grid-cols-2 gap-2">
                {(["stance", "balance", "edging", "rotation"] as const).map((k) => (
                  <div key={k} className="rounded-lg border border-border p-2 text-center">
                    <p className="text-lg font-bold text-foreground">{result.scores[k]}</p>
                    <p className="text-[10px] capitalize text-muted-foreground">{k}</p>
                  </div>
                ))}
              </div>
              {result.feedback.length > 0 && (
                <div className="mt-4 w-full space-y-2 text-left">
                  {result.feedback.slice(0, 3).map((fb) => (
                    <div key={fb.id} className="rounded-lg border border-border p-2">
                      <p className="text-xs font-medium text-foreground">{fb.title}</p>
                      <p className="text-[10px] text-muted-foreground">{fb.description}</p>
                    </div>
                  ))}
                </div>
              )}
              <Button className="mt-6 w-full" onClick={reset}>
                <RotateCcw className="mr-2 h-3 w-3" /> Analyze another video
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
