import { useRef, useState, useEffect, useCallback } from "react";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

interface VideoTrimScrubberProps {
  /** Reference to the <video> element for thumbnail generation & seeking */
  videoEl: HTMLVideoElement | null;
  duration: number;
  maxTrimSeconds: number;
  trimRange: [number, number]; // percentage 0–100
  onTrimChange: (range: [number, number]) => void;
  /** Called when the playhead scrubber moves (percentage 0–100) */
  onPlayheadSeek: (pct: number) => void;
  className?: string;
}

/* ─── Helpers ─── */

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const FILMSTRIP_FRAMES = 12;
const BAR_HEIGHT = 56; // px
const HANDLE_W = 14; // px – width of each bracket handle

/* ─── Component ─── */

export function VideoTrimScrubber({
  videoEl,
  duration,
  maxTrimSeconds,
  trimRange,
  onTrimChange,
  onPlayheadSeek,
  className,
}: VideoTrimScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [playheadPct, setPlayheadPct] = useState(trimRange[0]);
  const [dragging, setDragging] = useState<"start" | "end" | "playhead" | null>(null);
  const generatingRef = useRef(false);

  // Keep playhead clamped within trim range
  useEffect(() => {
    setPlayheadPct((prev) => Math.max(trimRange[0], Math.min(prev, trimRange[1])));
  }, [trimRange]);

  // Generate filmstrip thumbnails using a cloned video to avoid seeking conflicts
  useEffect(() => {
    if (!videoEl || duration <= 0) return;

    let cancelled = false;
    generatingRef.current = true;

    // Create a separate video element for thumbnail capture so we don't
    // interfere with the user-facing video's currentTime.
    const thumbVideo = document.createElement("video");
    thumbVideo.src = videoEl.currentSrc || videoEl.src;
    thumbVideo.muted = true;
    thumbVideo.preload = "auto";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const thumbW = 80;
    const thumbH = BAR_HEIGHT;
    canvas.width = thumbW;
    canvas.height = thumbH;

    const newFrames: string[] = [];

    const captureFrame = async (index: number) => {
      if (cancelled || index >= FILMSTRIP_FRAMES) {
        if (!cancelled) {
          setFrames(newFrames);
          generatingRef.current = false;
        }
        return;
      }
      // Offset slightly so frame 0 isn't a black pre-decoded frame
      const time = Math.max(0.1, (index / FILMSTRIP_FRAMES) * duration);
      thumbVideo.currentTime = time;
      await new Promise<void>((resolve) => {
        const handler = () => {
          thumbVideo.removeEventListener("seeked", handler);
          resolve();
        };
        thumbVideo.addEventListener("seeked", handler);
      });
      if (cancelled) return;

      const vw = thumbVideo.videoWidth;
      const vh = thumbVideo.videoHeight;
      const scale = Math.max(thumbW / vw, thumbH / vh);
      const sw = vw * scale;
      const sh = vh * scale;
      ctx.clearRect(0, 0, thumbW, thumbH);
      ctx.drawImage(thumbVideo, (thumbW - sw) / 2, (thumbH - sh) / 2, sw, sh);
      newFrames.push(canvas.toDataURL("image/jpeg", 0.5));
      await captureFrame(index + 1);
    };

    thumbVideo.addEventListener("loadeddata", () => {
      if (!cancelled) captureFrame(0);
    }, { once: true });

    return () => {
      cancelled = true;
      generatingRef.current = false;
      thumbVideo.src = "";
    };
  }, [videoEl, duration]);

  /* ─── Pointer helpers ─── */

  const getPct = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    // Account for handle padding on each side
    const innerLeft = rect.left + HANDLE_W;
    const innerWidth = rect.width - HANDLE_W * 2;
    return Math.max(0, Math.min(100, ((clientX - innerLeft) / innerWidth) * 100));
  }, []);

  const maxPct = (maxTrimSeconds / Math.max(duration, 0.01)) * 100;

  const handlePointerDown = useCallback(
    (type: "start" | "end" | "playhead") => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(type);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const pct = getPct(e.clientX);

      if (dragging === "playhead") {
        const clamped = Math.max(trimRange[0], Math.min(pct, trimRange[1]));
        setPlayheadPct(clamped);
        onPlayheadSeek(clamped);
        return;
      }

      let [start, end] = trimRange;
      if (dragging === "start") {
        start = pct;
        // Sliding window: push end if needed
        if (end - start > maxPct) {
          end = Math.min(start + maxPct, 100);
          if (end >= 100) { end = 100; start = 100 - maxPct; }
        }
        // Don't let start pass end
        if (start > end - 1) start = end - 1;
        if (start < 0) start = 0;
      } else {
        end = pct;
        // Sliding window: push start if needed
        if (end - start > maxPct) {
          start = Math.max(end - maxPct, 0);
          if (start <= 0) { start = 0; end = maxPct; }
        }
        // Don't let end pass start
        if (end < start + 1) end = start + 1;
        if (end > 100) end = 100;
      }

      onTrimChange([start, end]);
    },
    [dragging, trimRange, maxPct, getPct, onTrimChange, onPlayheadSeek]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  // Click on track area → move playhead
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      // Only if clicking the track itself, not a handle
      if ((e.target as HTMLElement).closest("[data-handle]")) return;
      const pct = getPct(e.clientX);
      const clamped = Math.max(trimRange[0], Math.min(pct, trimRange[1]));
      setPlayheadPct(clamped);
      onPlayheadSeek(clamped);
    },
    [getPct, trimRange, onPlayheadSeek]
  );

  /* ─── Computed ─── */
  const trimStart = (trimRange[0] / 100) * duration;
  const trimEnd = (trimRange[1] / 100) * duration;
  const trimDuration = trimEnd - trimStart;

  return (
    <div className={cn("select-none", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Trim &amp; scrub (max. {maxTrimSeconds}s)
        </span>
      </div>

      {/* Track wrapper – padding accommodates handles that sit outside the filmstrip */}
      <div
        ref={trackRef}
        className="relative cursor-pointer"
        style={{ height: BAR_HEIGHT, paddingLeft: HANDLE_W, paddingRight: HANDLE_W }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleTrackClick}
      >
        {/* Inner filmstrip area */}
        <div className="relative h-full w-full overflow-hidden rounded-md">
          {/* Filmstrip background */}
          <div className="absolute inset-0 flex">
            {frames.length > 0
              ? frames.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-full flex-1 object-cover"
                    draggable={false}
                  />
                ))
              : Array.from({ length: FILMSTRIP_FRAMES }).map((_, i) => (
                  <div key={i} className="h-full flex-1 bg-secondary" />
                ))}
          </div>

          {/* Dimmed regions outside trim */}
          <div
            className="absolute inset-y-0 left-0 bg-background/70"
            style={{ width: `${trimRange[0]}%` }}
          />
          <div
            className="absolute inset-y-0 right-0 bg-background/70"
            style={{ width: `${100 - trimRange[1]}%` }}
          />

          {/* Trim bracket border (top & bottom lines) */}
          <div
            className="absolute inset-y-0 pointer-events-none border-y-[3px] border-primary"
            style={{
              left: `${trimRange[0]}%`,
              width: `${trimRange[1] - trimRange[0]}%`,
            }}
          />

          {/* Playhead scrubber */}
          <div
            data-handle
            className="absolute z-30 cursor-ew-resize top-0 bottom-0"
            style={{ left: `${playheadPct}%`, transform: "translateX(-50%)" }}
            onPointerDown={handlePointerDown("playhead")}
          >
            <div className="mx-auto h-full w-[3px] rounded-full bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)]" />
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 h-2.5 w-4 rounded-b-sm bg-white shadow-md" />
          </div>

          {/* Start handle – inside the overflow-hidden area, anchored to trim start */}
          <div
            data-handle
            className={cn(
              "absolute inset-y-0 z-20 flex cursor-ew-resize items-center justify-center rounded-l-md bg-primary transition-shadow",
              dragging === "start" && "shadow-lg shadow-primary/40"
            )}
            style={{
              width: HANDLE_W,
              left: `calc(${trimRange[0]}% - ${HANDLE_W}px)`,
            }}
            onPointerDown={handlePointerDown("start")}
          >
            <div className="h-5 w-0.5 rounded-full bg-primary-foreground/80" />
          </div>

          {/* End handle */}
          <div
            data-handle
            className={cn(
              "absolute inset-y-0 z-20 flex cursor-ew-resize items-center justify-center rounded-r-md bg-primary transition-shadow",
              dragging === "end" && "shadow-lg shadow-primary/40"
            )}
            style={{
              width: HANDLE_W,
              left: `${trimRange[1]}%`,
            }}
            onPointerDown={handlePointerDown("end")}
          >
            <div className="h-5 w-0.5 rounded-full bg-primary-foreground/80" />
          </div>
        </div>
      </div>

      {/* Time labels */}
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground" style={{ paddingLeft: HANDLE_W, paddingRight: HANDLE_W }}>
        <span>{formatTime(trimStart)}</span>
        <span className="font-medium">
          {formatTime(trimDuration)} selected
        </span>
        <span>{formatTime(trimEnd)}</span>
      </div>
    </div>
  );
}
