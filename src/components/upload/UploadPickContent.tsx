import { useState, useCallback, useRef } from "react";
import { Upload, Smartphone, QrCode, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadSkierSelect } from "@/components/upload/UploadSkierSelect";
import { analysisService } from "@/services/analysis.service";
import { cn } from "@/lib/utils";

interface UploadPickContentProps {
  /** Called when user selects a skier and clicks continue */
  onContinue: (skierId: number) => void;
  /** Optional extra content rendered below (e.g. sign-in helper) */
  footer?: React.ReactNode;
  /** When provided, skip file upload and go directly to skier select */
  initialFile?: File;
  /** Override the submit button label */
  submitLabel?: string;
}

type ViewState = "pick" | "skier-select";

export function UploadPickContent({ onContinue, footer, initialFile, submitLabel }: UploadPickContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<ViewState>(initialFile ? "skier-select" : "pick");
  const [file, setFile] = useState<File | null>(initialFile ?? null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setView("pick");
    setFile(null);
    setErrorMsg("");
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFileSelect = useCallback((f: File) => {
    const validation = analysisService.validateFile(f);
    if (!validation.valid) {
      setErrorMsg(validation.error!);
      return;
    }
    setErrorMsg("");
    setFile(f);
    setView("skier-select");
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

  if (view === "skier-select" && file) {
    return (
      <UploadSkierSelect
        file={file}
        onCancel={initialFile ? () => {} : reset}
        onContinue={onContinue}
        submitLabel={submitLabel}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-2">
        <p className="text-sm font-medium text-foreground">Upload a short ski clip</p>
        <p className="text-xs text-muted-foreground mt-1">
          Drag and drop a clip from this device, or send one from your phone.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors",
          dragOver ? "border-foreground bg-secondary" : "border-border",
          errorMsg && "border-destructive/50"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium text-foreground">
          Drag & drop your ski clip here
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Up to 250 MB</p>
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
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* OR divider */}
      <div className="relative flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Send from phone */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
          <Smartphone className="h-5 w-5 text-accent-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Send from your phone</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Most ski videos live on your phone. Scan to upload there.
        </p>
        <div className="mt-1 flex h-28 w-28 items-center justify-center rounded-lg border border-border bg-accent">
          <QrCode className="h-14 w-14 text-accent-foreground/60" />
        </div>
      </div>

      {footer}
    </div>
  );
}
