import { useRef, useState, useEffect, useCallback } from "react";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

interface VideoTrimScrubberProps {
  videoEl: HTMLVideoElement | null;
  duration: number;
  maxTrimSeconds: number;
  trimRange: [number, number]; // percentage 0–100
  onTrimChange: (range: [number, number]) => void;
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
const BAR_HEIGHT = 56;
const HANDLE_W = 14;

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

  // Keep playhead clamped within trim range
  useEffect(() => {
    setPlayheadPct((prev) => Math.max(trimRange[0], Math.min(prev, trimRange[1])));
  }, [trimRange]);

  // Generate filmstrip thumbnails using a separate video element
  useEffect(() => {
    if (!videoEl || duration <= 0) return;

    let cancelled = false;

    const thumbVideo = document.createElement("video");
    thumbVideo.src = videoEl.currentSrc || videoEl.src;
    thumbVideo.muted = true;
    thumbVideo.preload = "auto";
    thumbVideo.playsInline = true;

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
        if (!cancelled) setFrames(newFrames);
        return;
      }
      const time = Math.max(0.1, ((index + 0.5) / FILMSTRIP_FRAMES) * duration);
      thumbVideo.currentTime = time;
      await new Promise<void>((resolve) => {
        const handler = () => { thumbVideo.removeEventListener("seeked", handler); resolve(); };
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
      thumbVideo.src = "";
    };
  }, [videoEl, duration]);

  /* ─── Pointer helpers ─── */

  // Convert clientX to percentage of the filmstrip area (excludes handle padding)
  const getPct = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
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
        if (end - start > maxPct) {
          end = Math.min(start + maxPct, 100);
          if (end >= 100) { end = 100; start = 100 - maxPct; }
        }
        if (start > end - 1) start = end - 1;
        if (start < 0) start = 0;
      } else {
        end = pct;
        if (end - start > maxPct) {
          start = Math.max(end - maxPct, 0);
          if (start <= 0) { start = 0; end = maxPct; }
        }
        if (end < start + 1) end = start + 1;
        if (end > 100) end = 100;
      }

      onTrimChange([start, end]);
    },
    [dragging, trimRange, maxPct, getPct, onTrimChange, onPlayheadSeek]
  );

  const handlePointerUp = useCallback(() => setDragging(null), []);

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
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

  // Convert a filmstrip percentage to a CSS left value within the padded track
  const toTrackLeft = (pct: number) => `calc(${HANDLE_W}px + ${pct}% * (100% - ${HANDLE_W * 2}px) / 100)`;
  // Simpler: since the filmstrip div is inside padding, we can use a style helper
  // Actually CSS calc can't do pct*pct. We'll use a wrapper approach instead.

  return (
    <div className={cn("select-none", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Trim &amp; scrub (max. {maxTrimSeconds}s)
        </span>
      </div>

      {/* Outer track – handles pointer events across the full width */}
      <div
        ref={trackRef}
        className="relative cursor-pointer"
        style={{ height: BAR_HEIGHT }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleTrackClick}
      >
        {/* Filmstrip container – full width, handles overlap on top */}
        <div
          className="absolute inset-0 overflow-hidden"
        >
          {/* Filmstrip thumbnails */}
          <div className="absolute inset-0 flex">
            {frames.length > 0
              ? frames.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-full flex-1 object-cover" draggable={false} />
                ))
              : Array.from({ length: FILMSTRIP_FRAMES }).map((_, i) => (
                  <div key={i} className="h-full flex-1 bg-secondary" />
                ))}
          </div>

          {/* Dimmed regions outside trim */}
          <div className="absolute inset-y-0 left-0 bg-background/70" style={{ width: `${trimRange[0]}%` }} />
          <div className="absolute inset-y-0 right-0 bg-background/70" style={{ width: `${100 - trimRange[1]}%` }} />

          {/* Trim bracket (top & bottom border lines) */}
          <div
            className="absolute inset-y-0 pointer-events-none border-y-[3px] border-primary"
            style={{ left: `${trimRange[0]}%`, width: `${trimRange[1] - trimRange[0]}%` }}
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
        </div>

        {/* Start handle – positioned in the outer (non-clipped) layer */}
        <HandleBracket
          side="start"
          pct={trimRange[0]}
          trackRef={trackRef}
          handleW={HANDLE_W}
          active={dragging === "start"}
          onPointerDown={handlePointerDown("start")}
        />

        {/* End handle */}
        <HandleBracket
          side="end"
          pct={trimRange[1]}
          trackRef={trackRef}
          handleW={HANDLE_W}
          active={dragging === "end"}
          onPointerDown={handlePointerDown("end")}
        />
      </div>

      {/* Time labels */}
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatTime(trimStart)}</span>
        <span className="font-medium">{formatTime(trimDuration)} selected</span>
        <span>{formatTime(trimEnd)}</span>
      </div>
    </div>
  );
}

/* ─── Handle bracket sub-component ─── */

function HandleBracket({
  side,
  pct,
  trackRef,
  handleW,
  active,
  onPointerDown,
}: {
  side: "start" | "end";
  pct: number;
  trackRef: React.RefObject<HTMLDivElement>;
  handleW: number;
  active: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Position the handle using pixel math
  useEffect(() => {
    const el = ref.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const trackWidth = track.clientWidth;
    const pxOffset = (pct / 100) * trackWidth;
    if (side === "start") {
      el.style.left = `${pxOffset - handleW}px`;
    } else {
      el.style.left = `${pxOffset}px`;
    }
  });

  return (
    <div
      ref={ref}
      data-handle
      className={cn(
        "absolute inset-y-0 z-20 flex cursor-ew-resize items-center justify-center bg-primary transition-shadow",
        side === "start" ? "rounded-l-md" : "rounded-r-md",
        active && "shadow-lg shadow-primary/40"
      )}
      style={{ width: handleW }}
      onPointerDown={onPointerDown}
    >
      <div className="h-5 w-0.5 rounded-full bg-primary-foreground/80" />
    </div>
  );
}
