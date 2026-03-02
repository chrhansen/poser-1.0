import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mock 3D Model Viewer — synchronized to a video timeline.
 * Renders a deterministic wireframe skeleton representing skier pose at each frame.
 * TODO_BACKEND_HOOKUP: Replace with real 3D model data from analysis pipeline.
 */

interface ModelViewerProps {
  /** Duration of the video in seconds */
  duration: number;
  /** Current playback time in seconds (for sync) */
  currentTime: number;
  /** Called when the user scrubs the model timeline */
  onSeek?: (time: number) => void;
  /** Whether video is currently playing */
  isPlaying?: boolean;
  /** Optional model data URL */
  modelUrl?: string;
  className?: string;
}

// Deterministic mock skeleton keypoints based on time
function getSkeletonPose(time: number, duration: number) {
  const t = duration > 0 ? time / duration : 0;
  const phase = Math.sin(t * Math.PI * 4); // oscillating turn motion
  const lean = Math.sin(t * Math.PI * 2) * 0.3;

  // Simple skeleton: head, shoulders, hips, knees, ankles (2D projected)
  const cx = 50 + phase * 12; // center-x shifts with turns
  return {
    head: { x: cx, y: 15 },
    shoulderL: { x: cx - 12 + lean * 5, y: 28 },
    shoulderR: { x: cx + 12 + lean * 5, y: 28 },
    hipL: { x: cx - 8, y: 48 },
    hipR: { x: cx + 8, y: 48 },
    kneeL: { x: cx - 10 + phase * 4, y: 65 },
    kneeR: { x: cx + 6 + phase * 2, y: 63 },
    ankleL: { x: cx - 12 + phase * 6, y: 82 },
    ankleR: { x: cx + 4 + phase * 3, y: 80 },
    // Ski edges
    skiL1: { x: cx - 18 + phase * 8, y: 85 },
    skiL2: { x: cx - 6 + phase * 4, y: 85 },
    skiR1: { x: cx - 2 + phase * 5, y: 83 },
    skiR2: { x: cx + 10 + phase * 2, y: 83 },
  };
}

function SkeletonSvg({ time, duration }: { time: number; duration: number }) {
  const p = getSkeletonPose(time, duration);

  const lines: [{ x: number; y: number }, { x: number; y: number }][] = [
    // Spine
    [p.head, { x: (p.shoulderL.x + p.shoulderR.x) / 2, y: (p.shoulderL.y + p.shoulderR.y) / 2 }],
    [{ x: (p.shoulderL.x + p.shoulderR.x) / 2, y: p.shoulderL.y }, { x: (p.hipL.x + p.hipR.x) / 2, y: p.hipL.y }],
    // Shoulders
    [p.shoulderL, p.shoulderR],
    // Hips
    [p.hipL, p.hipR],
    // Left leg
    [p.hipL, p.kneeL], [p.kneeL, p.ankleL],
    // Right leg
    [p.hipR, p.kneeR], [p.kneeR, p.ankleR],
    // Skis
    [p.skiL1, p.skiL2],
    [p.skiR1, p.skiR2],
  ];

  const joints = [p.head, p.shoulderL, p.shoulderR, p.hipL, p.hipR, p.kneeL, p.kneeR, p.ankleL, p.ankleR];

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[20, 40, 60, 80].map((y) => (
        <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="2 2" />
      ))}
      {/* Bones */}
      {lines.map(([a, b], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="hsl(var(--accent))" strokeWidth="1.2" strokeLinecap="round" />
      ))}
      {/* Joints */}
      {joints.map((j, i) => (
        <circle key={i} cx={j.x} cy={j.y} r={i === 0 ? 3 : 1.5} fill="hsl(var(--foreground))" />
      ))}
      {/* Head circle */}
      <circle cx={p.head.x} cy={p.head.y} r="4" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.8" />
    </svg>
  );
}

export function ModelViewer({ duration, currentTime, onSeek, isPlaying, modelUrl, className }: ModelViewerProps) {
  const [internalTime, setInternalTime] = useState(currentTime);
  const [playing, setPlaying] = useState(isPlaying ?? false);
  const animRef = useRef<ReturnType<typeof setInterval>>();

  // Sync from external currentTime
  useEffect(() => {
    setInternalTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
    setPlaying(isPlaying ?? false);
  }, [isPlaying]);

  // Internal playback
  useEffect(() => {
    if (playing && duration > 0) {
      animRef.current = setInterval(() => {
        setInternalTime((t) => {
          const next = t + 0.1;
          if (next >= duration) {
            setPlaying(false);
            return duration;
          }
          return next;
        });
      }, 100);
    }
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [playing, duration]);

  const handleSeek = useCallback((val: number[]) => {
    setInternalTime(val[0]);
    onSeek?.(val[0]);
  }, [onSeek]);

  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-secondary", className)}>
      {/* Viewport */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-t-xl bg-background/50">
        {modelUrl ? (
          <SkeletonSvg time={internalTime} duration={duration} />
        ) : (
          <SkeletonSvg time={internalTime} duration={duration} />
        )}
        <div className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {/* TODO_BACKEND_HOOKUP: Replace with real 3D renderer */}
          Mock 3D · {internalTime.toFixed(1)}s
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <div className="flex-1">
          <Slider
            value={[internalTime]}
            min={0}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => { setInternalTime(0); onSeek?.(0); }}
          aria-label="Reset"
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
        <span className="min-w-[3rem] text-right text-[10px] text-muted-foreground">
          {internalTime.toFixed(1)}s / {duration.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
