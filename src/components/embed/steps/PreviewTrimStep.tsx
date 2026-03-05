import { useRef, useState, useEffect, useCallback } from "react";
import { Scissors, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { SkierDetection, SkierBbox } from "@/services/embed-api.service";
import { embedApiService } from "@/services/embed-api.service";

interface PreviewTrimStepProps {
  file: File;
  maxTrimSeconds: number;
  onContinue: (payload: {
    trimStart: number;
    trimEnd: number;
    bbox: SkierBbox;
    objectId: number;
    normalizedTime: number;
  }) => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function PreviewTrimStep({ file, maxTrimSeconds, onContinue }: PreviewTrimStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);
  const [detections, setDetections] = useState<SkierDetection[]>([]);
  const [selectedSkier, setSelectedSkier] = useState<number | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualClick, setManualClick] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      // Default trim to full range, capped at max
      const endPct = dur > maxTrimSeconds ? (maxTrimSeconds / dur) * 100 : 100;
      setTrimRange([0, endPct]);
    }
  };

  // Auto-detect skiers on load
  useEffect(() => {
    if (!videoRef.current || !videoUrl || duration <= 0) return;
    setDetecting(true);
    embedApiService
      .detectSkiers(videoRef.current)
      .then((dets) => {
        setDetections(dets);
        if (dets.length > 0) setSelectedSkier(dets[0].object_id);
        if (dets.length === 0) setManualMode(true);
      })
      .catch(() => setManualMode(true))
      .finally(() => setDetecting(false));
  }, [videoUrl, duration]);

  const handleTrimChange = useCallback(
    (values: number[]) => {
      let [start, end] = values;
      const maxPct = (maxTrimSeconds / Math.max(duration, 0.01)) * 100;
      if (end - start > maxPct) {
        end = start + maxPct;
      }
      setTrimRange([start, Math.min(end, 100)]);
      if (videoRef.current && duration > 0) {
        videoRef.current.currentTime = (start / 100) * duration;
      }
    },
    [duration, maxTrimSeconds]
  );

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!manualMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setManualClick({ x, y });
    setSelectedSkier(1);
  };

  const trimStart = (trimRange[0] / 100) * duration;
  const trimEnd = (trimRange[1] / 100) * duration;
  const trimDuration = trimEnd - trimStart;

  const handleContinue = () => {
    if (!selectedSkier && !manualClick) {
      setError("Please select a skier to track.");
      return;
    }
    setError("");

    const skier = detections.find((d) => d.object_id === selectedSkier);
    const bbox: SkierBbox = skier
      ? skier.bbox
      : manualClick
      ? { x1: manualClick.x - 0.05, y1: manualClick.y - 0.1, x2: manualClick.x + 0.05, y2: manualClick.y + 0.1 }
      : { x1: 0, y1: 0, x2: 1, y2: 1 };

    const normalizedTime = videoRef.current
      ? videoRef.current.currentTime / Math.max(duration, 0.01)
      : 0;

    onContinue({
      trimStart,
      trimEnd,
      bbox,
      objectId: selectedSkier ?? 1,
      normalizedTime,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Video preview */}
      {videoUrl && (
        <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
          <video
            ref={videoRef}
            src={videoUrl}
            className={cn("w-full max-h-[40vh] object-contain", manualMode && "cursor-crosshair")}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handleVideoClick}
            muted
            playsInline
          />
          {/* Manual click indicator */}
          {manualClick && manualMode && (
            <div
              className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-accent/20 pointer-events-none"
              style={{ left: `${manualClick.x * 100}%`, top: `${manualClick.y * 100}%` }}
            />
          )}
        </div>
      )}

      {/* Trim controls */}
      {duration > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Select the section to analyze (max. {maxTrimSeconds} seconds)
            </span>
          </div>
          <Slider
            value={trimRange}
            onValueChange={handleTrimChange}
            min={0}
            max={100}
            step={0.5}
            minStepsBetweenThumbs={1}
            className="w-full"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatTime(trimStart)}</span>
            <span>Duration: {formatTime(trimDuration)}</span>
            <span>{formatTime(trimEnd)}</span>
          </div>
        </div>
      )}

      {/* Skier selection */}
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Pick a skier to track.</p>
        {detecting && (
          <p className="text-xs text-muted-foreground animate-pulse">Detecting skiers…</p>
        )}
        {!detecting && detections.length > 0 && (
          <div className="flex gap-3">
            {detections.map((det) => (
              <button
                key={det.object_id}
                onClick={() => {
                  setSelectedSkier(det.object_id);
                  setManualClick(null);
                  setManualMode(false);
                  setError("");
                }}
                className={cn(
                  "h-16 w-16 overflow-hidden rounded-lg border-2 bg-secondary/50 transition-all flex items-center justify-center",
                  selectedSkier === det.object_id && !manualMode
                    ? "border-accent ring-2 ring-accent/20"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <span className="text-[10px] font-medium text-muted-foreground">{det.label}</span>
              </button>
            ))}
          </div>
        )}
        {!detecting && manualMode && !manualClick && (
          <p className="text-xs text-muted-foreground">
            Click on the skier in the video above to select them.
          </p>
        )}
        {manualClick && (
          <p className="text-xs text-accent">Skier selected via manual click.</p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button size="lg" className="w-full" onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
}
