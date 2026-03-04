import { useState, useRef, useCallback, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Dummy thumbnails for detected skiers
const DUMMY_THUMBNAILS = [
  { id: "skier-1", label: "Skier 1" },
  { id: "skier-2", label: "Skier 2" },
  { id: "skier-3", label: "Skier 3" },
];

interface NewAnalysisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAnalysisSheet({ open, onOpenChange }: NewAnalysisSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [scrubValue, setScrubValue] = useState([0]);
  const [duration, setDuration] = useState(0);
  const [selectedThumb, setSelectedThumb] = useState(DUMMY_THUMBNAILS[0].id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When sheet opens without a file, trigger file picker
  useEffect(() => {
    if (open && !file) {
      // Small delay to let the drawer animation start
      const t = setTimeout(() => inputRef.current?.click(), 200);
      return () => clearTimeout(t);
    }
  }, [open, file]);

  const handleFileSelect = useCallback((f: File) => {
    const allowed = ["video/mp4", "video/quicktime", "video/webm"];
    if (!allowed.includes(f.type)) {
      toast.error("Please upload an MP4, MOV, or WebM file.");
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      toast.error("File must be under 100MB.");
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
    setScrubValue([0]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      handleFileSelect(f);
    } else {
      // User cancelled the file picker — close the sheet
      onOpenChange(false);
    }
  };

  const handleScrub = (value: number[]) => {
    setScrubValue(value);
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = (value[0] / 100) * duration;
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleStartAnalysis = () => {
    toast.success("Analysis started! (UI-only demo)");
    handleClose();
  };

  const handleClose = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFile(null);
    setVideoUrl(null);
    setScrubValue([0]);
    setDuration(0);
    setSelectedThumb(DUMMY_THUMBNAILS[0].id);
    onOpenChange(false);
  };

  return (
    <>
      {/* Hidden file input — always in DOM */}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleInputChange}
      />

      <Drawer open={open && !!file} onOpenChange={(v) => { if (!v) handleClose(); }}>
        <DrawerContent className="max-h-[92vh] focus:outline-none">
          <DrawerTitle className="sr-only">New Analysis</DrawerTitle>

          <div className="flex flex-col gap-4 px-4 pb-6 pt-2 sm:px-6 sm:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">New Analysis</h2>
                {file && (
                  <p className="text-xs text-muted-foreground">
                    {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Video preview */}
            {videoUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border bg-black">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full max-h-[45vh] object-contain"
                  onLoadedMetadata={handleLoadedMetadata}
                  muted
                  playsInline
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30">
                <Film className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            {/* Scrubber */}
            {videoUrl && (
              <div className="px-1">
                <Slider
                  value={scrubValue}
                  onValueChange={handleScrub}
                  max={100}
                  step={0.5}
                  className="w-full"
                />
              </div>
            )}

            {/* Detected skier thumbnails (dummy) */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Pick a skier to track</p>
              <div className="flex gap-3">
                {DUMMY_THUMBNAILS.map((thumb) => (
                  <button
                    key={thumb.id}
                    onClick={() => setSelectedThumb(thumb.id)}
                    className={cn(
                      "relative h-16 w-16 overflow-hidden rounded-lg border-2 bg-secondary/50 transition-all",
                      selectedThumb === thumb.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-[10px] font-medium text-muted-foreground">{thumb.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Analysis button */}
            <Button
              size="lg"
              className="w-full mt-2"
              onClick={handleStartAnalysis}
            >
              Start Analysis
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
