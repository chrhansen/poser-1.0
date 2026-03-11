import { useState, useCallback, useRef } from "react";
import { X, Upload, QrCode, Smartphone, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { UploadSkierSelect } from "@/components/upload/UploadSkierSelect";
import { analysisService } from "@/services/analysis.service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface NewAnalysisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewState = "pick" | "skier-select";

export function NewAnalysisSheet({ open, onOpenChange }: NewAnalysisSheetProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [view, setView] = useState<ViewState>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setView("pick");
    setFile(null);
    setErrorMsg("");
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 300);
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

  const handleContinue = (skierId: number) => {
    toast.success("Analysis started! (UI-only demo)");
    handleClose();
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <h2 className="text-base font-semibold text-foreground">New Analysis</h2>
        <button
          onClick={handleClose}
          className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {view === "pick" && (
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
          </div>
        )}

        {view === "skier-select" && file && (
          <UploadSkierSelect
            file={file}
            onCancel={reset}
            onContinue={handleContinue}
          />
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <SheetContent
          side="bottom"
          className="flex h-[92dvh] flex-col p-0 rounded-t-xl [&>button]:hidden"
        >
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="flex max-w-lg flex-col overflow-hidden rounded-xl p-0 max-h-[85vh]">
        {content}
      </DialogContent>
    </Dialog>
  );
}
