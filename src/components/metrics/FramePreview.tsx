import { cn } from "@/lib/utils";

/**
 * Deterministic mock frame preview — generates a unique visual per frame index.
 * TODO_BACKEND_HOOKUP: Replace with real frame thumbnails from analysis pipeline.
 */

interface FramePreviewProps {
  frameIndex: number;
  totalFrames: number;
  similarity: number; // 0-1
  className?: string;
}

// Deterministic pseudo-random from frame index
function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function FramePreview({ frameIndex, totalFrames, similarity, className }: FramePreviewProps) {
  const progress = totalFrames > 1 ? frameIndex / (totalFrames - 1) : 0;
  const hue = 200 + progress * 40; // blue to cyan range
  const saturation = 40 + similarity * 40;

  // Generate deterministic "landscape" bars
  const bars = Array.from({ length: 12 }, (_, i) => {
    const h = 20 + seededRandom(frameIndex * 100 + i) * 60;
    const x = (i / 12) * 100;
    return { x, h, opacity: 0.3 + seededRandom(frameIndex * 50 + i) * 0.5 };
  });

  // Skier dot position
  const skierX = 30 + progress * 40 + Math.sin(frameIndex * 0.8) * 10;
  const skierY = 35 + Math.cos(frameIndex * 0.5) * 15;

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <svg viewBox="0 0 100 80" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Sky gradient */}
        <defs>
          <linearGradient id={`sky-${frameIndex}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${hue}, ${saturation}%, 85%)`} />
            <stop offset="100%" stopColor={`hsl(${hue + 20}, ${saturation - 10}%, 95%)`} />
          </linearGradient>
        </defs>
        <rect width="100" height="80" fill={`url(#sky-${frameIndex})`} />

        {/* Mountain terrain bars */}
        {bars.map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y={80 - bar.h}
            width={100 / 12 + 1}
            height={bar.h}
            fill={`hsl(${hue + 40}, 15%, ${50 + seededRandom(frameIndex + i) * 20}%)`}
            opacity={bar.opacity}
          />
        ))}

        {/* Slope line */}
        <line
          x1="0" y1={55 - progress * 10}
          x2="100" y2={45 + progress * 5}
          stroke="hsl(var(--foreground))"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* Skier marker */}
        <circle cx={skierX} cy={skierY} r="3" fill="hsl(var(--accent))" />
        <circle cx={skierX} cy={skierY} r="5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.5" opacity="0.5" />

        {/* Frame info */}
        <text x="3" y="8" fontSize="5" fill="hsl(var(--foreground))" opacity="0.6" fontFamily="monospace">
          F{frameIndex + 1}
        </text>
        <text x="97" y="8" fontSize="5" fill="hsl(var(--foreground))" opacity="0.6" fontFamily="monospace" textAnchor="end">
          {Math.round(similarity * 100)}%
        </text>
      </svg>

      {/* Similarity color bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{
        background: `linear-gradient(90deg, hsl(var(--destructive)) 0%, hsl(var(--accent)) 50%, hsl(120, 60%, 50%) 100%)`,
        clipPath: `inset(0 ${100 - similarity * 100}% 0 0)`,
      }} />
    </div>
  );
}
