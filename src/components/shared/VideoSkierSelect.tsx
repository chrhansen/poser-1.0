import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Scissors } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { SkierDetection, SkierBbox } from "@/services/embed-api.service";
import { embedApiService } from "@/services/embed-api.service";

/* ─── Types ─── */

export interface VideoSkierSelectResult {
  trimStart: number;
  trimEnd: number;
  bbox: SkierBbox;
  objectId: number;
  normalizedTime: number;
}

interface VideoSkierSelectProps {
  file: File;
  maxTrimSeconds?: number;
  /** Render prop for the action button area. Receives whether a skier is selected and the result payload. */
  children: (props: { selected: boolean; getResult: () => VideoSkierSelectResult }) => React.ReactNode;
}

/* ─── Helpers ─── */

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ─── Component ─── */

export function VideoSkierSelect({
  file,
  maxTrimSeconds = 20,
  children,
}: VideoSkierSelectProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);

  // Skier detection
  const [detections, setDetections] = useState<SkierDetection[]>([]);
  const [selectedSkier, setSelectedSkier] = useState<number | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  // Manual fallback
  const [manualMode, setManualMode] = useState(false);
  const [manualClick, setManualClick] = useState<{ x: number; y: number } | null>(null);

  // Create object URL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setDuration(dur);
    const endPct = dur > maxTrimSeconds ? (maxTrimSeconds / dur) * 100 : 100;
    setTrimRange([0, endPct]);
    setTimeout(() => captureThumbnails(), 300);
  };

  // Auto-detect skiers once video is ready
  useEffect(() => {
    if (!videoRef.current || !videoUrl || duration <= 0) return;
    setDetecting(true);
    embedApiService
      .detectSkiers(videoRef.current)
      .then((dets) => {
        setDetections(dets);
        if (dets.length > 0) {
          setSelectedSkier(dets[0].object_id);
        } else {
          setManualMode(true);
        }
        // After detection, capture thumbnails for each detected skier
        setTimeout(() => captureThumbnails(dets), 100);
      })
      .catch(() => setManualMode(true))
      .finally(() => setDetecting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, duration]);

  const captureThumbnails = (dets?: SkierDetection[]) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const skiers = dets ?? detections;
    const newThumbs: Record<number, string> = {};
    for (const det of skiers) {
      const sx = det.bbox.x1 * canvas.width;
      const sy = det.bbox.y1 * canvas.height;
      const sw = (det.bbox.x2 - det.bbox.x1) * canvas.width;
      const sh = (det.bbox.y2 - det.bbox.y1) * canvas.height;

      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = Math.max(sw, 1);
      thumbCanvas.height = Math.max(sh, 1);
      const tCtx = thumbCanvas.getContext("2d");
      if (tCtx) {
        tCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
        newThumbs[det.object_id] = thumbCanvas.toDataURL("image/jpeg", 0.7);
      }
    }
    setThumbnails(newThumbs);
  };

  const handleTrimChange = useCallback(
    (values: number[]) => {
      let [start, end] = values;
      const maxPct = (maxTrimSeconds / Math.max(duration, 0.01)) * 100;
      if (end - start > maxPct) {
        end = start + maxPct;
      }
      const prev = trimRange;
      const newRange: [number, number] = [start, Math.min(end, 100)];
      setTrimRange(newRange);
      if (videoRef.current && duration > 0) {
        const movedEnd = newRange[1] !== prev[1];
        const seekPct = movedEnd ? newRange[1] : newRange[0];
        videoRef.current.currentTime = (seekPct / 100) * duration;
      }
    },
    [duration, maxTrimSeconds, trimRange]
  );

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!manualMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setManualClick({ x, y });
    setSelectedSkier(1);
  };

  const handleSelectDetection = (objectId: number) => {
    setSelectedSkier(objectId);
    setManualClick(null);
    setManualMode(false);
  };

  // Computed
  const trimStart = (trimRange[0] / 100) * duration;
  const trimEnd = (trimRange[1] / 100) * duration;
  const trimDuration = trimEnd - trimStart;
  const hasSelection = selectedSkier !== null;

  const selectedDet = detections.find((d) => d.object_id === selectedSkier);

  // Overlay positions derived from detection bbox (center point)
  const getOverlayStyle = (det: SkierDetection) => {
    const cx = ((det.bbox.x1 + det.bbox.x2) / 2) * 100;
    const cy = ((det.bbox.y1 + det.bbox.y2) / 2) * 100;
    const w = (det.bbox.x2 - det.bbox.x1) * 100;
    const h = (det.bbox.y2 - det.bbox.y1) * 100;
    return {
      left: `${cx}%`,
      top: `${cy}%`,
      width: `${w}%`,
      height: `${h}%`,
      transform: "translate(-50%, -50%)",
    };
  };

  const getResult = useCallback((): VideoSkierSelectResult => {
    const bbox: SkierBbox = selectedDet
      ? selectedDet.bbox
      : manualClick
      ? { x1: manualClick.x - 0.05, y1: manualClick.y - 0.1, x2: manualClick.x + 0.05, y2: manualClick.y + 0.1 }
      : { x1: 0, y1: 0, x2: 1, y2: 1 };

    const normalizedTime = videoRef.current
      ? videoRef.current.currentTime / Math.max(duration, 0.01)
      : 0;

    return {
      trimStart,
      trimEnd,
      bbox,
      objectId: selectedSkier ?? 1,
      normalizedTime,
    };
  }, [selectedDet, manualClick, trimStart, trimEnd, selectedSkier, duration]);

  return (
    <div className="flex flex-col gap-3">
      {/* Video preview with skier overlays */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className={cn("w-full max-h-[40vh] object-contain", manualMode && "cursor-crosshair")}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={handleVideoClick}
            muted
            playsInline
          />
        )}

        {/* Hidden canvas for thumbnail capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Clickable skier zones from detections */}
        {detections.map((det) => (
          <button
            key={det.object_id}
            onClick={() => handleSelectDetection(det.object_id)}
            className="absolute z-10 rounded-full focus:outline-none"
            style={getOverlayStyle(det)}
            aria-label={`Select ${det.label}`}
          />
        ))}

        {/* Pulsing rings when no selection */}
        <AnimatePresence>
          {!selectedSkier &&
            detections.map((det) => (
              <motion.div
                key={det.object_id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pointer-events-none absolute"
                style={getOverlayStyle(det)}
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
          {selectedDet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute z-20 flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg"
              style={{
                left: `${((selectedDet.bbox.x1 + selectedDet.bbox.x2) / 2) * 100}%`,
                top: `${selectedDet.bbox.y2 * 100 + 4}%`,
                transform: "translateX(-50%)",
              }}
            >
              <Check className="h-3 w-3" />
              Skier selected
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual click indicator */}
        {manualClick && manualMode && (
          <div
            className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-accent/20 pointer-events-none"
            style={{ left: `${manualClick.x * 100}%`, top: `${manualClick.y * 100}%` }}
          />
        )}
      </div>

      {/* Trim scrubber */}
      {duration > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Select the section to analyze (max. {maxTrimSeconds}s)
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

      {/* Skier thumbnail selectors */}
      <div>
        {detecting && (
          <p className="text-xs text-muted-foreground animate-pulse">Detecting skiers…</p>
        )}
        {!detecting && detections.length > 0 && (
          <div className="flex items-center gap-3">
            {detections.map((det) => (
              <button
                key={det.object_id}
                onClick={() => handleSelectDetection(det.object_id)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  selectedSkier === det.object_id && !manualMode
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-muted-foreground"
                )}
                aria-label={`Select ${det.label}`}
              >
                {thumbnails[det.object_id] ? (
                  <img
                    src={thumbnails[det.object_id]}
                    alt={det.label}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/50">
                    <span className="text-[10px] font-medium text-muted-foreground">{det.label}</span>
                  </div>
                )}
                {selectedSkier === det.object_id && !manualMode && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                    <Check className="h-4 w-4 text-primary-foreground drop-shadow" />
                  </div>
                )}
              </button>
            ))}
            <span className="text-xs text-muted-foreground">Select a skier</span>
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

      {/* Action slot via render prop */}
      {children({ selected: hasSelection, getResult })}
    </div>
  );
}
