import { useRef, useState, useCallback } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadStepProps {
  maxSizeMB: number;
  onFileSelected: (file: File) => void;
  error?: string;
}

export function UploadStep({ maxSizeMB, onFileSelected, error }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (f: File) => onFileSelected(f),
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          "flex w-full flex-col items-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
          dragOver ? "border-accent bg-accent/5" : "border-border",
          error && "border-destructive/50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-4 text-base font-semibold text-foreground">
          Upload your ski video
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Max. {maxSizeMB} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Your video will be analyzed for ski technique metrics
      </p>
    </div>
  );
}
