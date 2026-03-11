import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Scissors } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Mock detected skiers — positions as percentages of the video frame */
const MOCK_SKIERS = [
  { id: 1, label: "Skier 1", x: 38, y: 55, cropX: 25, cropY: 35, cropW: 26, cropH: 40 },
  { id: 2, label: "Skier 2", x: 62, y: 48, cropX: 50, cropY: 28, cropW: 24, cropH: 40 },
];

interface UploadSkierSelectProps {
  file: File;
  onCancel: () => void;
  onContinue: (skierId: number) => void;
}

const MAX_TRIM_SECONDS = 20;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function UploadSkierSelect({ file, onCancel, onContinue }: UploadSkierSelectProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);
  const [selectedSkier, setSelectedSkier] = useState<number | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  // Create object URL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      // Capture thumbnails from the first frame after a tiny delay
      setTimeout(() => captureThumbnails(), 300);
    }
  };

  const captureThumbnails = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const newThumbs: Record<number, string> = {};
    for (const skier of MOCK_SKIERS) {
      const sx = (skier.cropX / 100) * canvas.width;
      const sy = (skier.cropY / 100) * canvas.height;
      const sw = (skier.cropW / 100) * canvas.width;
      const sh = (skier.cropH / 100) * canvas.height;

      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = sw;
      thumbCanvas.height = sh;
      const tCtx = thumbCanvas.getContext("2d");
      if (tCtx) {
        tCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        newThumbs[skier.id] = thumbCanvas.toDataURL("image/jpeg", 0.7);
      }
    }
    setThumbnails(newThumbs);
  };

  const handleScrub = (value: number[]) => {
    setScrubValue(value);
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = (value[0] / 100) * duration;
    }
  };

  const handleSelect = (id: number) => {
    setSelectedSkier(id);
  };

  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div>
          <p className="text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Video preview with skier overlays */}
      <div className="relative mx-4 mt-3 overflow-hidden rounded-xl border border-border bg-secondary">
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full max-h-[40vh] object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            muted
            playsInline
          />
        )}

        {/* Hidden canvas for thumbnail capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Clickable skier zones */}
        {MOCK_SKIERS.map((skier) => (
          <button
            key={skier.id}
            onClick={() => handleSelect(skier.id)}
            className="absolute z-10 rounded-full focus:outline-none"
            style={{
              left: `${skier.x}%`,
              top: `${skier.y}%`,
              width: "14%",
              height: "28%",
              transform: "translate(-50%, -50%)",
            }}
            aria-label={`Select ${skier.label}`}
          />
        ))}

        {/* Pulsing rings */}
        <AnimatePresence>
          {!selectedSkier &&
            MOCK_SKIERS.map((skier) => (
              <motion.div
                key={skier.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-none absolute"
                style={{
                  left: `${skier.x}%`,
                  top: `${skier.y}%`,
                  width: "12%",
                  height: "24%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                />
                <div className="absolute inset-[15%] rounded-full border-2 border-primary/70" />
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Selection confirmation chip */}
        <AnimatePresence>
          {selectedSkier && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute z-20 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg"
              style={{
                left: `${MOCK_SKIERS.find((s) => s.id === selectedSkier)!.x}%`,
                top: `${MOCK_SKIERS.find((s) => s.id === selectedSkier)!.y + 16}%`,
                transform: "translateX(-50%)",
              }}
            >
              <Check className="h-3 w-3" />
              Skier selected
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scrubber */}
      {duration > 0 && (
        <div className="px-5 pt-3">
          <Slider
            value={scrubValue}
            onValueChange={handleScrub}
            max={100}
            step={0.5}
            className="w-full"
          />
        </div>
      )}

      {/* Thumbnail selectors + label */}
      <div className="flex items-center gap-3 px-4 pt-3">
        {MOCK_SKIERS.map((skier) => (
          <button
            key={skier.id}
            onClick={() => handleSelect(skier.id)}
            className={cn(
              "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
              selectedSkier === skier.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-muted-foreground"
            )}
            aria-label={`Select ${skier.label}`}
          >
            {thumbnails[skier.id] ? (
              <img
                src={thumbnails[skier.id]}
                alt={skier.label}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                <span className="text-[10px] font-medium text-muted-foreground">{skier.label}</span>
              </div>
            )}
            {selectedSkier === skier.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                <Check className="h-4 w-4 text-primary-foreground drop-shadow" />
              </div>
            )}
          </button>
        ))}
        <span className="text-xs text-muted-foreground">Select a skier</span>
      </div>

      {/* Action */}
      <div className="p-4 pt-4">
        <Button
          className="w-full"
          disabled={!selectedSkier}
          onClick={() => selectedSkier && onContinue(selectedSkier)}
        >
          {selectedSkier ? "Analyze my skiing" : "Select a skier to continue"}
        </Button>
      </div>
    </div>
  );
}
